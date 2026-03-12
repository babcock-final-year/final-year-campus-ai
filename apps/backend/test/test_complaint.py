import json
import unittest

from app import create_app, db
from app.models import User

# python -m unittest discover -s test -p "test_complaint.py" -v


class ComplaintTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app("testing")
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        db.create_all()

        self.user = {
            "full_name": "Complaint User",
            "email": "complaint@example.com",
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
        token = body["access_token"]

        user = User.query.filter_by(email=data["email"]).first()
        self.assertIsNotNone(user)
        conf_token = user.generate_confirmation_token()
        conf = self.client.get(f"/api/v1/auth/confirm/{conf_token}")
        self.assertEqual(conf.status_code, 200)
        return token, user.id

    def get_guest_token(self):
        res = self.client.post("/api/v1/auth/guest")
        self.assertEqual(res.status_code, 201)
        body = json.loads(res.data)
        return body["access_token"], body["user"]["id"]

    def test_create_complaint(self):
        token, uid = self.register_and_confirm()

        payload = {"title": "Broken Wifi", "description": "Wifi drops every 5 minutes"}
        res = self.client.post(
            "/api/v1/complaints",
            headers={"Authorization": f"Bearer {token}"},
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)
        body = json.loads(res.data)
        self.assertEqual(body["title"], "Broken Wifi")
        self.assertEqual(body["user_id"], uid)

    def test_guest_sees_only_own_but_confirmed_sees_all(self):
        # guest posts complaint
        guest_token, guest_id = self.get_guest_token()
        payload1 = {"title": "Guest Issue", "description": "Guest problem details"}
        res = self.client.post(
            "/api/v1/complaints",
            headers={"Authorization": f"Bearer {guest_token}"},
            data=json.dumps(payload1),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)

        # confirmed user posts complaint
        dev_token, dev_id = self.register_and_confirm(
            {"full_name": "Dev", "email": "dev@example.com", "password": "DevPass123"}
        )
        payload2 = {"title": "Dev Issue", "description": "Dev problem"}
        res = self.client.post(
            "/api/v1/complaints",
            headers={"Authorization": f"Bearer {dev_token}"},
            data=json.dumps(payload2),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)

        # guest lists complaints -> should see only their own
        res = self.client.get(
            "/api/v1/complaints", headers={"Authorization": f"Bearer {guest_token}"}
        )
        self.assertEqual(res.status_code, 200)
        body = json.loads(res.data)
        self.assertEqual(len(body["complaints"]), 1)
        self.assertEqual(body["complaints"][0]["title"], "Guest Issue")

        # confirmed user lists complaints -> per current logic, confirmed non-guest sees all
        res = self.client.get(
            "/api/v1/complaints", headers={"Authorization": f"Bearer {dev_token}"}
        )
        self.assertEqual(res.status_code, 200)
        body = json.loads(res.data)
        titles = {c["title"] for c in body["complaints"]}
        self.assertIn("Guest Issue", titles)
        self.assertIn("Dev Issue", titles)

    def test_get_complaint_permissions(self):
        # create complaint as guest
        guest_token, guest_id = self.get_guest_token()
        payload = {"title": "Guest Only", "description": "Details"}
        res = self.client.post(
            "/api/v1/complaints",
            headers={"Authorization": f"Bearer {guest_token}"},
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)
        cid = json.loads(res.data)["id"]

        # another guest should not view
        other_guest_token, other_guest_id = self.get_guest_token()
        res = self.client.get(
            f"/api/v1/complaints/{cid}", headers={"Authorization": f"Bearer {other_guest_token}"}
        )
        self.assertEqual(res.status_code, 403)

        # confirmed non-guest (dev) can view
        dev_token, dev_id = self.register_and_confirm(
            {"full_name": "Dev2", "email": "dev2@example.com", "password": "DevPass123"}
        )
        res = self.client.get(
            f"/api/v1/complaints/{cid}", headers={"Authorization": f"Bearer {dev_token}"}
        )
        self.assertEqual(res.status_code, 200)


if __name__ == "__main__":
    unittest.main()
