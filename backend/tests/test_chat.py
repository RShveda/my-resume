import time
from unittest.mock import MagicMock, patch

import pytest
from django.test import Client


def _valid_payload(message="test question", **overrides):
    """Build a valid chat request payload with timestamp."""
    payload = {
        "message": message,
        "website": "",
        "_ts": int(time.time() * 1000) - 5000,  # 5 seconds ago
    }
    payload.update(overrides)
    return payload


def _post_chat(client, payload=None, **kwargs):
    """Post to /api/chat/ with enforce_csrf_checks=False by default."""
    import json

    if payload is None:
        payload = _valid_payload()
    return client.post(
        "/api/chat/",
        data=json.dumps(payload),
        content_type="application/json",
        **kwargs,
    )


@pytest.mark.django_db
class TestChatView:
    def setup_method(self):
        # enforce_csrf_checks=False is the default for Django test Client
        self.client = Client()

    def test_rejects_get(self):
        response = self.client.get("/api/chat/")
        assert response.status_code == 405

    def test_rejects_empty_message(self):
        response = _post_chat(self.client, _valid_payload(message=""))
        assert response.status_code == 400
        assert response.json()["error"] == "Message is required"

    def test_rejects_missing_message(self):
        payload = _valid_payload()
        del payload["message"]
        response = _post_chat(self.client, payload)
        assert response.status_code == 400

    def test_rejects_long_message(self):
        response = _post_chat(self.client, _valid_payload(message="a" * 501))
        assert response.status_code == 400
        assert "too long" in response.json()["error"]

    def test_rejects_invalid_json(self):
        response = self.client.post(
            "/api/chat/",
            data="not json",
            content_type="application/json",
        )
        assert response.status_code == 400

    # --- Honeypot tests ---

    def test_honeypot_returns_fake_response(self):
        """Bots that fill the hidden website field get a fake 200 response."""
        payload = _valid_payload(website="http://spam.example.com")
        response = _post_chat(self.client, payload)
        assert response.status_code == 200
        assert response["Content-Type"] == "text/event-stream"
        content = b"".join(response.streaming_content).decode()
        assert '"done": true' in content

    def test_honeypot_empty_string_passes(self):
        """Empty website field (legit user) should not trigger honeypot."""
        with patch("resume_api.llm.stream_chat") as mock_stream, patch(
            "resume_api.prompt.build_system_prompt"
        ) as mock_prompt:
            mock_prompt.return_value = "system prompt"
            mock_stream.return_value = iter(["OK"])

            response = _post_chat(self.client, _valid_payload(website=""))
            assert response.status_code == 200
            content = b"".join(response.streaming_content).decode()
            assert '"token": "OK"' in content

    # --- Timestamp tests ---

    def test_rejects_missing_timestamp(self):
        payload = _valid_payload()
        del payload["_ts"]
        response = _post_chat(self.client, payload)
        assert response.status_code == 400
        assert "timestamp" in response.json()["error"].lower()

    def test_rejects_too_fast_timestamp(self):
        """Requests with a timestamp less than 3 seconds ago are rejected."""
        payload = _valid_payload(_ts=int(time.time() * 1000))  # right now
        response = _post_chat(self.client, payload)
        assert response.status_code == 400
        assert "fast" in response.json()["error"].lower()

    def test_rejects_invalid_timestamp(self):
        payload = _valid_payload(_ts="not-a-number")
        response = _post_chat(self.client, payload)
        assert response.status_code == 400

    def test_accepts_valid_timestamp(self):
        """A timestamp 5+ seconds ago should pass validation."""
        with patch("resume_api.llm.stream_chat") as mock_stream, patch(
            "resume_api.prompt.build_system_prompt"
        ) as mock_prompt:
            mock_prompt.return_value = "system prompt"
            mock_stream.return_value = iter(["OK"])

            payload = _valid_payload(_ts=int(time.time() * 1000) - 5000)
            response = _post_chat(self.client, payload)
            assert response.status_code == 200

    # --- CSRF tests ---

    def test_csrf_enforced(self):
        """With enforce_csrf_checks=True, requests without CSRF token get 403."""
        csrf_client = Client(enforce_csrf_checks=True)
        response = _post_chat(csrf_client)
        assert response.status_code == 403

    # --- Streaming tests ---

    @patch("django_ratelimit.decorators.is_ratelimited", return_value=False)
    @patch("resume_api.llm.stream_chat")
    @patch("resume_api.prompt.build_system_prompt")
    def test_streams_response(self, mock_prompt, mock_stream, _mock_rl):
        mock_prompt.return_value = "system prompt"
        mock_stream.return_value = iter(["Hello", " world"])

        response = _post_chat(self.client)
        assert response.status_code == 200
        assert response["Content-Type"] == "text/event-stream"

        content = b"".join(response.streaming_content).decode()
        assert '"token": "Hello"' in content
        assert '"token": " world"' in content
        assert '"done": true' in content

    @patch("django_ratelimit.decorators.is_ratelimited", return_value=False)
    @patch("resume_api.llm.stream_chat")
    @patch("resume_api.prompt.build_system_prompt")
    def test_saves_chat_log(self, mock_prompt, mock_stream, _mock_rl):
        from resume_api.models import ChatLog

        mock_prompt.return_value = "system prompt"
        mock_stream.return_value = iter(["Hello", " world"])

        response = _post_chat(self.client)
        # Consume the stream to trigger finally block
        b"".join(response.streaming_content)

        assert ChatLog.objects.count() == 1
        log = ChatLog.objects.first()
        assert log.question == "test question"
        assert log.answer == "Hello world"


class TestPromptBuilder:
    def test_builds_prompt_with_context(self):
        from resume_api.prompt import build_system_prompt

        prompt = build_system_prompt()
        assert "Roman Shveda" in prompt
        assert "Senior Software Engineer" in prompt
        assert "Python" in prompt
        assert "HTS" in prompt
        assert len(prompt) > 500


class TestLLMClient:
    @patch("resume_api.llm._get_client")
    def test_yields_tokens(self, mock_get_client):
        from resume_api.llm import stream_chat

        mock_client = MagicMock()
        mock_get_client.return_value = mock_client

        chunk1 = MagicMock()
        chunk1.choices = [MagicMock()]
        chunk1.choices[0].delta.content = "Hello"

        chunk2 = MagicMock()
        chunk2.choices = [MagicMock()]
        chunk2.choices[0].delta.content = " world"

        chunk3 = MagicMock()
        chunk3.choices = [MagicMock()]
        chunk3.choices[0].delta.content = None

        mock_client.chat.completions.create.return_value = iter([chunk1, chunk2, chunk3])

        tokens = list(stream_chat("system", "hello"))
        assert tokens == ["Hello", " world"]
