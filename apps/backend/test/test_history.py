import json
import unittest
from unittest.mock import patch

from app import create_app, db
from app.models import User

# python -m unittest discover -s test -p "test_history.py" -v


class HistoryTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app("testing")
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        db.create_all()

        self.user = {
            "full_name": "History User",
            "email": "history@example.com",
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

        user = User.query.filter_by(email=data["email"]).first()
        self.assertIsNotNone(user)
        token = user.generate_confirmation_token()
        conf = self.client.get(f"/api/v1/auth/confirm/{token}")
        self.assertEqual(conf.status_code, 200)

        return access, user.id

    @patch("app.core.rag.llm.LLM.get_response")
    def test_list_chats_and_get_messages(self, mock_get_response):
        mock_get_response.return_value = "Assistant says hi"

        token, uid = self.register_and_confirm()

        # create chat
        res = self.client.post(
            "/api/v1/chat",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"title": "History Chat"}),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)
        chat_id = json.loads(res.data)["chat_id"]

        # post messages
        for text in ["First message", "Second message"]:
            res = self.client.post(
                f"/api/v1/chat/{chat_id}/message",
                headers={"Authorization": f"Bearer {token}"},
                data=json.dumps({"content": text}),
                content_type="application/json",
            )
            self.assertEqual(res.status_code, 201)

        # list chats
        res = self.client.get("/api/v1/history/chats", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res.status_code, 200)
        body = json.loads(res.data)
        self.assertIn("chats", body)
        self.assertTrue(any(c["id"] == chat_id for c in body["chats"]))

        # get messages
        res = self.client.get(
            f"/api/v1/history/chat/{chat_id}/messages", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(res.status_code, 200)
        hist = json.loads(res.data)
        if isinstance(hist, dict) and "messages" in hist:
            msgs = hist["messages"]
        elif isinstance(hist, list):
            msgs = hist
        else:
            self.fail(f"Unexpected response shape for messages: {hist}")

        self.assertGreaterEqual(len(msgs), 2)

    @patch("app.core.rag.llm.LLM.get_response")
    def test_like_message_and_search(self, mock_get_response):
        mock_get_response.return_value = "Assistant reply"
        token, uid = self.register_and_confirm()

        res = self.client.post(
            "/api/v1/chat",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"title": "Search Chat"}),
            content_type="application/json",
        )
        chat_id = json.loads(res.data)["chat_id"]

        # post message with specific content
        res = self.client.post(
            f"/api/v1/chat/{chat_id}/message",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"content": "UniqueSearchTerm"}),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)

        # fetch messages to get msg id
        res = self.client.get(
            f"/api/v1/history/chat/{chat_id}/messages", headers={"Authorization": f"Bearer {token}"}
        )
        data = json.loads(res.data)
        # Support endpoints that may return either the ChatHistoryResponse dict
        # or directly a list of messages (some wrappers may unwrap the model).
        if isinstance(data, dict) and "messages" in data:
            msgs = data["messages"]
        elif isinstance(data, list):
            msgs = data
        else:
            self.fail(f"Unexpected response shape for messages: {data}")

        msg_id = msgs[-1]["id"]

        # like message
        res = self.client.post(
            f"/api/v1/history/chat/{chat_id}/message/{msg_id}/like",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps({"like": True}),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        liked = json.loads(res.data)
        self.assertTrue(liked["is_liked"])

        # search
        res = self.client.get(
            "/api/v1/history/search?q=UniqueSearchTerm",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 200)
        results = json.loads(res.data)["results"]
        self.assertTrue(any("UniqueSearchTerm" in r["content"] for r in results))

    @patch("app.core.rag.llm.LLM.get_response")
    def test_clear_all_chats(self, mock_get_response):
        mock_get_response.return_value = "ok"
        token, uid = self.register_and_confirm()

        # create two chats
        for i in range(2):
            res = self.client.post(
                "/api/v1/chat",
                headers={"Authorization": f"Bearer {token}"},
                data=json.dumps({"title": f"Chat {i}"}),
                content_type="application/json",
            )
            self.assertEqual(res.status_code, 201)

        # clear all
        res = self.client.delete(
            "/api/v1/history/chats", headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(res.status_code, 200)

        # ensure no chats
        res = self.client.get("/api/v1/history/chats", headers={"Authorization": f"Bearer {token}"})
        body = json.loads(res.data)
        self.assertEqual(len(body["chats"]), 0)


if __name__ == "__main__":
    unittest.main()
