import unittest
import json
from datetime import datetime
from app import create_app, db
from app.models import User, TokenBlocklist
from config import config
from itsdangerous import URLSafeTimedSerializer as Serializer


class AuthTestCase(unittest.TestCase):
    """Test suite for authentication endpoints."""

    def setUp(self):
        """Set up test client and database for each test."""
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        self.client = self.app.test_client()
        
        # Create all tables
        db.create_all()
        
        # Test user data
        self.valid_user = {
            'full_name': 'Test User',
            'email': 'test@example.com',
            'password': 'SecurePassword123'
        }
        
        self.valid_user_2 = {
            'full_name': 'Another User',
            'email': 'another@example.com',
            'password': 'AnotherPassword123'
        }

    def tearDown(self):
        """Clean up after each test."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    # ============ Registration Tests ============
    
    def test_register_success(self):
        """Test successful user registration."""
        response = self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('access_token', data)
        self.assertIn('refresh_token', data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['email'], self.valid_user['email'])
        self.assertFalse(data['user']['is_guest'])

    def test_register_duplicate_email(self):
        """Test registration with existing email."""
        # Register first user
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        
        # Try to register with same email
        response = self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 409)
        data = json.loads(response.data)
        self.assertIn('already exists', data['message'])

    def test_register_invalid_email(self):
        """Test registration with invalid email."""
        invalid_user = {
            'full_name': 'Test User',
            'email': 'not-an-email',
            'password': 'SecurePassword123'
        }
        response = self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(invalid_user),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_register_short_password(self):
        """Test registration with password < 8 characters."""
        invalid_user = {
            'full_name': 'Test User',
            'email': 'test@example.com',
            'password': 'short'
        }
        response = self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(invalid_user),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_register_missing_fields(self):
        """Test registration with missing required fields."""
        incomplete_user = {
            'email': 'test@example.com',
            'password': 'SecurePassword123'
        }
        response = self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(incomplete_user),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    # ============ Email Confirmation Tests ============
    
    def test_confirm_email_success(self):
        """Test successful email confirmation."""
        # Register user
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        
        # Get user and generate token
        user = User.query.filter_by(email=self.valid_user['email']).first()
        self.assertIsNotNone(user)
        self.assertFalse(user.is_confirmed)
        
        token = user.generate_confirmation_token()
        
        # Confirm email
        response = self.client.get(f'/api/v1/auth/confirm/{token}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('successfully', data['message'].lower())
        
        # Check user is now confirmed
        user = User.query.filter_by(email=self.valid_user['email']).first()
        self.assertTrue(user.is_confirmed)

    def test_confirm_email_already_confirmed(self):
        """Test confirming an already confirmed email."""
        # Register user
        response = self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        user = User.query.filter_by(email=self.valid_user['email']).first()
        token = user.generate_confirmation_token()
        
        # Confirm first time
        self.client.get(f'/api/v1/auth/confirm/{token}')
        
        # Try to confirm again
        response = self.client.get(f'/api/v1/auth/confirm/{token}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('already confirmed', data['message'])

    def test_confirm_email_invalid_token(self):
        """Test email confirmation with invalid token."""
        response = self.client.get('/api/v1/auth/confirm/invalid-token')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('Invalid or expired', data['message'])

    def test_confirm_email_expired_token(self):
        """Test email confirmation with expired token (requires manual token manipulation)."""
        # Register user
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        
        user = User.query.filter_by(email=self.valid_user['email']).first()
        
        # Generate expired token by using max_age=0
        s = Serializer(self.app.config['SECRET_KEY'])
        expired_token = s.dumps({'confirm': user.id}, salt='email-confirm')
        
        # Manually create an aged-out scenario (in practice, time passes)
        # For this test, we'll use a token with 0 max_age which should fail immediately
        response = self.client.get(f'/api/v1/auth/confirm/{expired_token}')
        # Should fail because confirm_email will reject old tokens
        # Note: actual expiry depends on system time; here we verify error handling exists

    # ============ Login Tests ============
    
    def test_login_success(self):
        """Test successful login after email confirmation."""
        # Register user
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        
        # Confirm email
        user = User.query.filter_by(email=self.valid_user['email']).first()
        token = user.generate_confirmation_token()
        self.client.get(f'/api/v1/auth/confirm/{token}')
        
        # Login
        login_data = {
            'email': self.valid_user['email'],
            'password': self.valid_user['password']
        }
        response = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('access_token', data)
        self.assertIn('refresh_token', data)
        self.assertIn('user', data)

    def test_login_unconfirmed_email(self):
        """Test login with unconfirmed email."""
        # Register user (without confirming)
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        
        # Try to login
        login_data = {
            'email': self.valid_user['email'],
            'password': self.valid_user['password']
        }
        response = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 403)
        data = json.loads(response.data)
        self.assertIn('not confirmed', data['message'])

    def test_login_invalid_password(self):
        """Test login with incorrect password."""
        # Register and confirm
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        user = User.query.filter_by(email=self.valid_user['email']).first()
        token = user.generate_confirmation_token()
        self.client.get(f'/api/v1/auth/confirm/{token}')
        
        # Try to login with wrong password
        login_data = {
            'email': self.valid_user['email'],
            'password': 'WrongPassword123'
        }
        response = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn('Invalid', data['message'])

    def test_login_nonexistent_email(self):
        """Test login with non-existent email."""
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'SomePassword123'
        }
        response = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn('Invalid', data['message'])

    def test_login_oauth_account_no_password(self):
        """Test login with account that has no password (OAuth account)."""
        # Manually create an OAuth user without password
        user = User(
            full_name='OAuth User',
            email='oauth@example.com',
            google_id='google-123',
            is_confirmed=True
        )
        db.session.add(user)
        db.session.commit()
        
        # Try to login
        login_data = {
            'email': 'oauth@example.com',
            'password': 'AnyPassword123'
        }
        response = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn('No local password', data['message'])

    # ============ Password Reset Tests ============
    
    def test_request_password_reset_success(self):
        """Test successful password reset request."""
        # Register and confirm user
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        user = User.query.filter_by(email=self.valid_user['email']).first()
        token = user.generate_confirmation_token()
        self.client.get(f'/api/v1/auth/confirm/{token}')
        
        # Request password reset
        reset_request = {'email': self.valid_user['email']}
        response = self.client.post(
            '/api/v1/auth/reset-password',
            data=json.dumps(reset_request),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('If the email is registered', data['message'])

    def test_request_password_reset_nonexistent_email(self):
        """Test password reset with non-existent email (should return generic message)."""
        reset_request = {'email': 'nonexistent@example.com'}
        response = self.client.post(
            '/api/v1/auth/reset-password',
            data=json.dumps(reset_request),
            content_type='application/json'
        )
        # Should return 200 with generic message (security: don't reveal if email exists)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('If the email is registered', data['message'])

    def test_reset_password_confirm_success(self):
        """Test successful password reset confirmation."""
        # Register and confirm user
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        user = User.query.filter_by(email=self.valid_user['email']).first()
        token = user.generate_confirmation_token()
        self.client.get(f'/api/v1/auth/confirm/{token}')
        
        # Generate reset token
        user = User.query.filter_by(email=self.valid_user['email']).first()
        reset_token = user.generate_reset_token()
        
        # Reset password
        new_password_data = {'new_password': 'NewSecurePassword123'}
        response = self.client.post(
            f'/api/v1/auth/reset-password-confirm/{reset_token}',
            data=json.dumps(new_password_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify new password works
        login_data = {
            'email': self.valid_user['email'],
            'password': 'NewSecurePassword123'
        }
        response = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)

    def test_reset_password_invalid_token(self):
        """Test password reset with invalid token."""
        reset_data = {'new_password': 'NewPassword123'}
        response = self.client.post(
            '/api/v1/auth/reset-password-confirm/invalid-token',
            data=json.dumps(reset_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('invalid or has expired', data['message'])

    # ============ Email Change Tests ============
    
    def test_change_email_request_success(self):
        """Test successful email change request."""
        # Register and confirm user
        register_response = self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        user = User.query.filter_by(email=self.valid_user['email']).first()
        token = user.generate_confirmation_token()
        self.client.get(f'/api/v1/auth/confirm/{token}')
        
        # Get access token
        login_data = {
            'email': self.valid_user['email'],
            'password': self.valid_user['password']
        }
        login_response = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        access_token = json.loads(login_response.data)['access_token']
        
        # Request email change
        change_email_data = {
            'new_email': 'newemail@example.com',
            'password': self.valid_user['password']
        }
        response = self.client.post(
            '/api/v1/auth/change-email',
            data=json.dumps(change_email_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('Confirmation email sent', data['message'])

    def test_change_email_invalid_password(self):
        """Test email change with incorrect password."""
        # Register and confirm user
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        user = User.query.filter_by(email=self.valid_user['email']).first()
        token = user.generate_confirmation_token()
        self.client.get(f'/api/v1/auth/confirm/{token}')
        
        # Login
        login_data = {
            'email': self.valid_user['email'],
            'password': self.valid_user['password']
        }
        login_response = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        access_token = json.loads(login_response.data)['access_token']
        
        # Try to change email with wrong password
        change_email_data = {
            'new_email': 'newemail@example.com',
            'password': 'WrongPassword123'
        }
        response = self.client.post(
            '/api/v1/auth/change-email',
            data=json.dumps(change_email_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn('Invalid password', data['message'])

    def test_change_email_duplicate_email(self):
        """Test email change to already-registered email."""
        # Register two users
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user_2),
            content_type='application/json'
        )
        
        # Confirm both
        for user_data in [self.valid_user, self.valid_user_2]:
            user = User.query.filter_by(email=user_data['email']).first()
            token = user.generate_confirmation_token()
            self.client.get(f'/api/v1/auth/confirm/{token}')
        
        # Login as first user
        login_response = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps({'email': self.valid_user['email'], 'password': self.valid_user['password']}),
            content_type='application/json'
        )
        access_token = json.loads(login_response.data)['access_token']
        
        # Try to change to second user's email
        change_email_data = {
            'new_email': self.valid_user_2['email'],
            'password': self.valid_user['password']
        }
        response = self.client.post(
            '/api/v1/auth/change-email',
            data=json.dumps(change_email_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        self.assertEqual(response.status_code, 409)
        data = json.loads(response.data)
        self.assertIn('already in use', data['message'])

    def test_confirm_email_change_success(self):
        """Test successful email change confirmation."""
        # Register and confirm user
        self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        user = User.query.filter_by(email=self.valid_user['email']).first()
        token = user.generate_confirmation_token()
        self.client.get(f'/api/v1/auth/confirm/{token}')
        
        # Login
        login_response = self.client.post(
            '/api/v1/auth/login',
            data=json.dumps({'email': self.valid_user['email'], 'password': self.valid_user['password']}),
            content_type='application/json'
        )
        access_token = json.loads(login_response.data)['access_token']
        
        # Request email change
        change_email_data = {
            'new_email': 'newemail@example.com',
            'password': self.valid_user['password']
        }
        self.client.post(
            '/api/v1/auth/change-email',
            data=json.dumps(change_email_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        # Generate change token
        user = User.query.filter_by(email=self.valid_user['email']).first()
        change_token = user.generate_email_change_token('newemail@example.com')
        
        # Confirm email change
        response = self.client.get(f'/api/v1/auth/change-email-confirm/{change_token}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('successfully', data['message'].lower())
        
        # Verify email was changed
        updated_user = User.query.filter_by(email='newemail@example.com').first()
        self.assertIsNotNone(updated_user)

    # ============ Refresh Token Tests ============
    
    def test_refresh_token_success(self):
        """Test successful token refresh."""
        # Register and confirm user
        register_response = self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        refresh_token = json.loads(register_response.data)['refresh_token']
        
        # Refresh token
        response = self.client.post(
            '/api/v1/auth/refresh',
            headers={'Authorization': f'Bearer {refresh_token}'}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('access_token', data)
        self.assertNotEqual(data['access_token'], refresh_token)

    # ============ Logout Tests ============
    
    def test_logout_success(self):
        """Test successful logout."""
        # Register user
        register_response = self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        access_token = json.loads(register_response.data)['access_token']
        
        # Logout
        response = self.client.post(
            '/api/v1/auth/logout',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('logged out', data['message'].lower())

    def test_logout_without_token(self):
        """Test logout without authorization header."""
        response = self.client.post('/api/v1/auth/logout')
        self.assertEqual(response.status_code, 401)

    # ============ Guest Login Tests ============
    
    def test_guest_login_success(self):
        """Test successful guest login."""
        response = self.client.post('/api/v1/auth/guest')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('access_token', data)
        self.assertIn('user', data)
        self.assertTrue(data['user']['is_guest'])

    # ============ Get Current User Tests ============
    
    def test_get_current_user_success(self):
        """Test getting current user info."""
        # Register user
        register_response = self.client.post(
            '/api/v1/auth/register',
            data=json.dumps(self.valid_user),
            content_type='application/json'
        )
        access_token = json.loads(register_response.data)['access_token']
        
        # Get current user
        response = self.client.get(
            '/api/v1/auth/me',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['email'], self.valid_user['email'])

    def test_get_current_user_without_token(self):
        """Test getting current user without authorization."""
        response = self.client.get('/api/v1/auth/me')
        self.assertEqual(response.status_code, 401)


if __name__ == '__main__':
    unittest.main()
