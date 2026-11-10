"""Cryptographic session token management and hashing utilities."""

import hashlib
import hmac
import secrets


def generate_session_token() -> str:
    """Generates a cryptographically secure URL-safe opaque session token."""
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    """Produces a secure SHA-256 digest of the session token for database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_session_token(token: str, token_hash: str) -> bool:
    """Compares candidate token against a stored hash in constant time."""
    candidate_hash = hash_session_token(token)
    return hmac.compare_digest(candidate_hash, token_hash)
