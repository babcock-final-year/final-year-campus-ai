import io
import json
import unittest

from app import create_app, db
from app.models import User

# python -m unittest discover -s test -p "test_users.py" -v


class UsersTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app("testing")
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        db.create_all()

        self.user = {
            "full_name": "Profile User",
            "email": "profile@example.com",
            "password": "Secret123",
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

    def test_get_user_profile(self):
        token, uid = self.register_and_confirm()

        res = self.client.get(f"/api/v1/users/{uid}", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res.status_code, 200)
        body = json.loads(res.data)
        self.assertIn("user", body)
        self.assertEqual(body["user"]["email"], self.user["email"])

    def test_update_profile_success(self):
        token, uid = self.register_and_confirm()

        payload = {"username": "newuser", "matric_no": "22/0123", "full_name": "New Name"}
        res = self.client.put(
            f"/api/v1/users/{uid}",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        body = json.loads(res.data)
        self.assertEqual(body["full_name"], "New Name")

    def test_update_profile_not_owner(self):
        token1, uid1 = self.register_and_confirm()
        user2 = {"full_name": "Other", "email": "other@example.com", "password": "Password123"}
        token2, uid2 = self.register_and_confirm(user2)

        # user2 tries to update user1
        payload = {"username": "hacker"}
        res = self.client.put(
            f"/api/v1/users/{uid1}",
            headers={"Authorization": f"Bearer {token2}"},
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 403)

    def test_avatar_upload(self):
        token, uid = self.register_and_confirm()

        data = {"avatar": (io.BytesIO(b"fake-image-bytes"), "avatar.jpg")}
        res = self.client.post(
            f"/api/v1/users/{uid}/avatar",
            headers={"Authorization": f"Bearer {token}"},
            data=data,
            content_type="multipart/form-data",
        )
        self.assertEqual(res.status_code, 200)
        body = json.loads(res.data)
        self.assertIn("avatar_url", body)


if __name__ == "__main__":
    unittest.main()
