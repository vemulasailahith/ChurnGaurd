"""
Supabase Authentication & Authorization Dependency for FastAPI

Validates incoming Supabase Bearer access tokens and verifies that the authenticated
user is an active record in the `authorized_members` table.
"""

import os
import logging
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import httpx

# Ensure environment variables are loaded
_env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()

logger = logging.getLogger(__name__)

# Security scheme for FastAPI OpenAPI documentation
security_bearer = HTTPBearer(auto_error=False)


class AuthorizedMember(BaseModel):
    id: str
    user_id: str
    email: str
    full_name: Optional[str] = None
    is_active: bool = True


def get_supabase_config():
    """Retrieve Supabase settings from environment variables."""
    url = (os.getenv("SUPABASE_URL", "")).rstrip("/")
    anon_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_PUBLISHABLE_KEY") or ""
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SECRET_KEY") or ""
    allowed_domain = os.getenv("ALLOWED_COMPANY_DOMAIN", "").strip().lower()

    # Use service role key if available, otherwise anon key for table queries
    query_key = service_role_key or anon_key
    return url, anon_key, query_key, allowed_domain


async def get_current_authorized_member(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
) -> AuthorizedMember:
    """
    FastAPI dependency that:
    1. Extracts and verifies Bearer token presence (HTTP 401 if missing).
    2. Validates the token against Supabase Auth API (HTTP 401 if invalid/expired).
    3. Checks company email domain restriction if ALLOWED_COMPANY_DOMAIN is set (HTTP 403 if mismatch).
    4. Verifies the user exists in `authorized_members` table (HTTP 403 if not found).
    5. Verifies `is_active == True` on the member record (HTTP 403 if deactivated).
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    supabase_url, anon_key, query_key, allowed_domain = get_supabase_config()

    if not supabase_url:
        logger.error("SUPABASE_URL is not configured on the backend server.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication server configuration error (SUPABASE_URL not set).",
        )

    # ── 1. Validate Supabase Access Token via Supabase Auth API ────────────────
    # Supabase verifies JWT signature, expiry, and revocation at /auth/v1/user
    auth_headers = {
        "Authorization": f"Bearer {token}",
        "apikey": anon_key or query_key,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            user_response = await client.get(
                f"{supabase_url}/auth/v1/user",
                headers=auth_headers,
            )
    except httpx.RequestError as exc:
        logger.error(f"Failed to connect to Supabase Auth service: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach authentication service. Please try again later.",
        )

    if user_response.status_code != 200:
        logger.warning(f"Supabase token validation failed (HTTP {user_response.status_code})")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, expired, or revoked authentication session. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_data = user_response.json()
    user_id = user_data.get("id")
    email = (user_data.get("email") or "").strip().lower()

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user session payload from authentication provider.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── 2. Check Optional Company Domain Restriction ────────────────────────────
    if allowed_domain:
        expected_suffix = f"@{allowed_domain}"
        if not email.endswith(expected_suffix):
            logger.warning(f"User email {email} does not match allowed domain {allowed_domain}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. User email must belong to company domain '@{allowed_domain}'.",
            )

    # ── 3. Verify user in `authorized_members` table ─────────────────────────────
    # Query Supabase PostgREST endpoint
    rest_headers = {
        "apikey": query_key,
        "Authorization": f"Bearer {query_key or token}",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            member_response = await client.get(
                f"{supabase_url}/rest/v1/authorized_members",
                params={"user_id": f"eq.{user_id}", "select": "*"},
                headers=rest_headers,
            )
    except httpx.RequestError as exc:
        logger.error(f"Failed to query authorized_members table: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify member authorization status. Please try again later.",
        )

    if member_response.status_code != 200:
        logger.error(
            f"Error querying authorized_members table: HTTP {member_response.status_code} - {member_response.text}"
        )
        if "schema cache" in member_response.text or "PGRST205" in member_response.text:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database setup required: 'authorized_members' table has not been created in Supabase yet. Please run the SQL schema script.",
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Unable to verify company member authorization.",
        )

    records = member_response.json()
    if not isinstance(records, list) or len(records) == 0:
        logger.warning(f"User {email} ({user_id}) is not listed in authorized_members.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Your account is not an authorized company member.",
        )

    member_record = records[0]

    # ── 4. Verify Active Status ─────────────────────────────────────────────────
    if not member_record.get("is_active", False):
        logger.warning(f"Authorized member {email} ({user_id}) account is deactivated (is_active=False).")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Your company member account has been deactivated.",
        )

    return AuthorizedMember(
        id=str(member_record.get("id")),
        user_id=str(member_record.get("user_id")),
        email=str(member_record.get("email")),
        full_name=member_record.get("full_name"),
        is_active=bool(member_record.get("is_active")),
    )
