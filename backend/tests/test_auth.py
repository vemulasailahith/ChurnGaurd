"""
ChurnGuard — Backend Authentication & Authorization Test Suite

Tests:
1. Public health check works without credentials (HTTP 200).
2. Protected endpoints reject missing authentication with HTTP 401.
3. Protected endpoints reject invalid/expired tokens with HTTP 401.
4. Valid authenticated users not in `authorized_members` are rejected with HTTP 403.
5. Inactive authorized members (is_active=False) are rejected with HTTP 403.
6. Active authorized members (is_active=True) are allowed access (HTTP 200).
7. Company domain restriction properly blocks non-matching email domains (HTTP 403).
"""

import os
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Set test environment variables before importing app
os.environ["SUPABASE_URL"] = "https://mock-test.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "mock-anon-key"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "mock-service-role-key"

import main
from auth.supabase_auth import AuthorizedMember

client = TestClient(main.app)


class TestSupabaseAuth(unittest.TestCase):

    def test_health_check_public(self):
        """Health endpoint should remain accessible without authentication (HTTP 200)."""
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("status"), "ok")

    def test_missing_token_returns_401(self):
        """Protected endpoints without Bearer token must return HTTP 401."""
        endpoints = [
            ("GET", "/api/analytics/overview"),
            ("GET", "/api/segments"),
            ("GET", "/api/model-performance"),
            ("POST", "/api/predict/churn"),
        ]
        for method, url in endpoints:
            if method == "GET":
                response = client.get(url)
            else:
                response = client.post(url, json={})
            self.assertEqual(
                response.status_code,
                401,
                f"Expected 401 for {method} {url}, got {response.status_code}",
            )
            self.assertIn("Authentication required", response.json().get("detail", ""))

    @patch("httpx.AsyncClient.get")
    def test_invalid_or_expired_token_returns_401(self, mock_get):
        """Tokens rejected by Supabase Auth must return HTTP 401."""
        # Mock Supabase /auth/v1/user returning 401 Unauthorized
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {"message": "Invalid JWT"}
        mock_get.return_value = mock_response

        response = client.get(
            "/api/analytics/overview",
            headers={"Authorization": "Bearer bad-or-expired-token"},
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid, expired, or revoked", response.json().get("detail", ""))

    @patch("httpx.AsyncClient.get")
    def test_authenticated_user_not_in_authorized_members_returns_403(self, mock_get):
        """Authenticated users who are NOT in authorized_members table must receive HTTP 403."""
        # 1. Supabase /auth/v1/user succeeds
        user_resp = MagicMock()
        user_resp.status_code = 200
        user_resp.json.return_value = {
            "id": "user-uuid-1234",
            "email": "external_user@gmail.com",
        }

        # 2. Supabase /rest/v1/authorized_members returns empty list (not found)
        members_resp = MagicMock()
        members_resp.status_code = 200
        members_resp.json.return_value = []

        mock_get.side_effect = [user_resp, members_resp]

        response = client.get(
            "/api/analytics/overview",
            headers={"Authorization": "Bearer valid-supabase-token"},
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("not an authorized company member", response.json().get("detail", ""))

    @patch("httpx.AsyncClient.get")
    def test_deactivated_member_returns_403(self, mock_get):
        """Authorized members with is_active=False must receive HTTP 403."""
        # 1. Supabase /auth/v1/user succeeds
        user_resp = MagicMock()
        user_resp.status_code = 200
        user_resp.json.return_value = {
            "id": "deactivated-uuid-5678",
            "email": "former_employee@company.com",
        }

        # 2. Supabase /rest/v1/authorized_members returns is_active=False
        members_resp = MagicMock()
        members_resp.status_code = 200
        members_resp.json.return_value = [
            {
                "id": "record-1",
                "user_id": "deactivated-uuid-5678",
                "email": "former_employee@company.com",
                "full_name": "Former Employee",
                "is_active": False,
            }
        ]

        mock_get.side_effect = [user_resp, members_resp]

        response = client.get(
            "/api/analytics/overview",
            headers={"Authorization": "Bearer deactivated-user-token"},
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("account has been deactivated", response.json().get("detail", ""))

    @patch("httpx.AsyncClient.get")
    def test_active_authorized_member_success_200(self, mock_get):
        """Active authorized members with is_active=True must get full access (HTTP 200)."""
        # 1. Supabase /auth/v1/user succeeds
        user_resp = MagicMock()
        user_resp.status_code = 200
        user_resp.json.return_value = {
            "id": "active-uuid-9999",
            "email": "analyst@company.com",
        }

        # 2. Supabase /rest/v1/authorized_members returns is_active=True
        members_resp = MagicMock()
        members_resp.status_code = 200
        members_resp.json.return_value = [
            {
                "id": "record-99",
                "user_id": "active-uuid-9999",
                "email": "analyst@company.com",
                "full_name": "Senior Risk Analyst",
                "is_active": True,
            }
        ]

        mock_get.side_effect = [user_resp, members_resp]

        response = client.get(
            "/api/analytics/overview",
            headers={"Authorization": "Bearer valid-authorized-token"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("totalCustomers", response.json())

    @patch.dict(os.environ, {"ALLOWED_COMPANY_DOMAIN": "churnguard-corp.com"})
    @patch("httpx.AsyncClient.get")
    def test_company_domain_restriction(self, mock_get):
        """When ALLOWED_COMPANY_DOMAIN is set, non-matching domain returns HTTP 403."""
        # Supabase /auth/v1/user succeeds with wrong domain
        user_resp = MagicMock()
        user_resp.status_code = 200
        user_resp.json.return_value = {
            "id": "uuid-other-domain",
            "email": "contractor@otherdomain.com",
        }

        mock_get.side_effect = [user_resp]

        response = client.get(
            "/api/analytics/overview",
            headers={"Authorization": "Bearer wrong-domain-token"},
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("must belong to company domain '@churnguard-corp.com'", response.json().get("detail", ""))

    @patch("httpx.AsyncClient.get")
    def test_predict_endpoint_with_auth(self, mock_get):
        """POST /api/predict/churn succeeds for active authorized members."""
        user_resp = MagicMock()
        user_resp.status_code = 200
        user_resp.json.return_value = {
            "id": "ml-engineer-id",
            "email": "engineer@company.com",
        }

        members_resp = MagicMock()
        members_resp.status_code = 200
        members_resp.json.return_value = [
            {
                "id": "rec-ml-1",
                "user_id": "ml-engineer-id",
                "email": "engineer@company.com",
                "full_name": "ML Engineer",
                "is_active": True,
            }
        ]

        mock_get.side_effect = [user_resp, members_resp]

        sample_customer = {
            "gender": "Female",
            "age": 42,
            "under30": "No",
            "seniorCitizen": "No",
            "married": "Yes",
            "dependents": "Yes",
            "numberOfDependents": 2,
            "referredAFriend": "Yes",
            "numberOfReferrals": 3,
            "tenureInMonths": 24,
            "offer": "Offer B",
            "phoneService": "Yes",
            "multipleLines": "No",
            "internetService": "Yes",
            "internetType": "Fiber Optic",
            "onlineSecurity": "Yes",
            "onlineBackup": "Yes",
            "deviceProtectionPlan": "Yes",
            "premiumTechSupport": "Yes",
            "streamingTV": "Yes",
            "streamingMovies": "No",
            "streamingMusic": "No",
            "unlimitedData": "Yes",
            "contract": "One Year",
            "paperlessBilling": "Yes",
            "paymentMethod": "Credit Card",
            "avgMonthlyLongDistanceCharges": 15.0,
            "avgMonthlyGBDownload": 40.0,
            "monthlyCharge": 75.0,
            "totalCharges": 1800.0,
            "totalRefunds": 0.0,
            "totalExtraDataCharges": 0.0,
            "totalLongDistanceCharges": 360.0,
            "totalRevenue": 2160.0,
            "satisfactionScore": 4,
            "cltv": 5000.0,
            "population": 25000,
        }

        response = client.post(
            "/api/predict/churn",
            json=sample_customer,
            headers={"Authorization": "Bearer ml-authorized-token"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("prediction", data)
        self.assertIn("churn_probability", data)
        self.assertIn("risk_level", data)
        self.assertIn("segment_label", data)


if __name__ == "__main__":
    unittest.main()
