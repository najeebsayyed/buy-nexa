"""Unit tests for cryptographic session token generation, hashing, and verification."""

from app.core.security import generate_session_token, hash_session_token, verify_session_token


def test_generate_session_token():
    token1 = generate_session_token()
    token2 = generate_session_token()
    assert isinstance(token1, str)
    assert len(token1) >= 40
    assert token1 != token2


def test_hash_session_token_deterministic():
    token = "test_token_12345"
    hash1 = hash_session_token(token)
    hash2 = hash_session_token(token)
    assert hash1 == hash2
    assert len(hash1) == 64  # SHA-256 hex digest length


def test_verify_session_token():
    token = generate_session_token()
    token_hash = hash_session_token(token)

    assert verify_session_token(token, token_hash)
    assert not verify_session_token("wrong_token", token_hash)
