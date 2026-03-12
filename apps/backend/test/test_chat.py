import json
import unittest
from unittest.mock import patch

from app import create_app, db
from app.models import User

# python -m unittest discover -s test -p "test_chat.py" -v


class ChatTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app("testing")
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        db.create_all()

        self.user = {
            "full_name": "Chat User",
            "email": "chat@example.com",
            "password": "Password123",
        }

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
        self.app_context.pop()

    def register_and_confirm(self, user_data=None):
        data = user_data or self.user
        res = self.client.post(
            "/api/v1/auth/register", data=json.dumps(data), content_type="application/json"
        )
        self.assertEqual(res.status_code, 201)
        body = json.loads(res.data)
        access = body["access_token"]

        # confirm email using token printed during register (retrieve user and generate token)
        user = User.query.filter_by(email=data["email"]).first()
        self.assertIsNotNone(user)
        token = user.generate_confirmation_token()
        conf = self.client.get(f"/api/v1/auth/confirm/{token}")
        self.assertEqual(conf.status_code, 200)

        return access, user.id

    def get_guest_token(self):
        res = self.client.post("/api/v1/auth/guest")
        self.assertEqual(res.status_code, 201)
        body = json.loads(res.data)
        return body["access_token"], body["user"]["id"]

    @patch("app.core.rag.llm.LLM.get_response")
    def test_create_chat_and_post_message(self, mock_get_response):
        mock_get_response.return_value = "Assistant reply"

        token, uid = self.register_and_confirm()

        # create chat
        res = self.client.post(
            "/api/v1/chat",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"title": "Test Chat"}),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)
        body = json.loads(res.data)
        chat_id = body["chat_id"]

        # post message
        msg = {"content": "Hello there"}
        res = self.client.post(
            f"/api/v1/chat/{chat_id}/message",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps(msg),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)
        body = json.loads(res.data)
        self.assertIn("content", body)
        self.assertEqual(body["content"], "Assistant reply")

        # get history
        res = self.client.get(
            f"/api/v1/chat/{chat_id}", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(res.status_code, 200)
        hist = json.loads(res.data)
        self.assertTrue("title" in hist or "messages" in hist)

    @patch("app.core.rag.llm.LLM.get_response")
    def test_guest_can_create_chat_and_post(self, mock_get_response):
        mock_get_response.return_value = "Guest assistant"

        token, uid = self.get_guest_token()

        # guest creates chat
        res = self.client.post(
            "/api/v1/chat",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"title": "Guest Chat"}),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)
        chat_id = json.loads(res.data)["chat_id"]

        # guest posts message
        res = self.client.post(
            f"/api/v1/chat/{chat_id}/message",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"content": "Hi"}),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)
        body = json.loads(res.data)
        self.assertEqual(body["content"], "Guest assistant")

    @patch("app.core.rag.llm.LLM.get_response")
    def test_non_owner_cannot_post(self, mock_get_response):
        mock_get_response.return_value = "Nope"

        # user1
        token1, uid1 = self.register_and_confirm()
        res = self.client.post(
            "/api/v1/chat",
            headers={"Authorization": f"Bearer {token1}"},
            data=json.dumps({"title": "U1 Chat"}),
            content_type="application/json",
        )
        chat_id = json.loads(res.data)["chat_id"]

        # user2
        user2 = {"full_name": "Two", "email": "two@example.com", "password": "Password123"}
        token2, uid2 = self.register_and_confirm(user2)

        # user2 tries to post to user1's chat
        res = self.client.post(
            f"/api/v1/chat/{chat_id}/message",
            headers={"Authorization": f"Bearer {token2}"},
            data=json.dumps({"content": "Cross post"}),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 403)


if __name__ == "__main__":
    unittest.main()
