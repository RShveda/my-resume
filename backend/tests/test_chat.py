from unittest.mock import MagicMock, patch

import pytest
from django.test import Client


@pytest.mark.django_db
class TestChatView:
    def test_rejects_get(self):
        client = Client()
        response = client.get("/api/chat/")
        assert response.status_code == 405

    def test_rejects_empty_message(self):
        client = Client()
        response = client.post(
            "/api/chat/",
            data='{"message": ""}',
            content_type="application/json",
        )
        assert response.status_code == 400
        assert response.json()["error"] == "Message is required"

    def test_rejects_missing_message(self):
        client = Client()
        response = client.post(
            "/api/chat/",
            data="{}",
            content_type="application/json",
        )
        assert response.status_code == 400

    def test_rejects_long_message(self):
        client = Client()
        response = client.post(
            "/api/chat/",
            data=f'{{"message": "{"a" * 501}"}}',
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "too long" in response.json()["error"]

    def test_rejects_invalid_json(self):
        client = Client()
        response = client.post(
            "/api/chat/",
            data="not json",
            content_type="application/json",
        )
        assert response.status_code == 400

    @patch("resume_api.llm.stream_chat")
    @patch("resume_api.prompt.build_system_prompt")
    def test_streams_response(self, mock_prompt, mock_stream):
        mock_prompt.return_value = "system prompt"
        mock_stream.return_value = iter(["Hello", " world"])

        client = Client()
        response = client.post(
            "/api/chat/",
            data='{"message": "test question"}',
            content_type="application/json",
        )
        assert response.status_code == 200
        assert response["Content-Type"] == "text/event-stream"

        content = b"".join(response.streaming_content).decode()
        assert '"token": "Hello"' in content
        assert '"token": " world"' in content
        assert '"done": true' in content

    @patch("resume_api.llm.stream_chat")
    @patch("resume_api.prompt.build_system_prompt")
    def test_saves_chat_log(self, mock_prompt, mock_stream):
        from resume_api.models import ChatLog

        mock_prompt.return_value = "system prompt"
        mock_stream.return_value = iter(["Hello", " world"])

        client = Client()
        response = client.post(
            "/api/chat/",
            data='{"message": "test question"}',
            content_type="application/json",
        )
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
