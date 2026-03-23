import json
import logging
import time

from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from django_ratelimit.decorators import ratelimit
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Certification, ChatLog, Experience, Skill
from .serializers import CertificationSerializer, ExperienceSerializer, SkillSerializer

logger = logging.getLogger(__name__)

_MIN_TIME_ON_PAGE_MS = 3000


@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok"})


@ensure_csrf_cookie
def csrf_token_view(request):
    """Set the CSRF cookie so JS clients can read it for POST requests."""
    return JsonResponse({"ok": True})


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer


class ExperienceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Experience.objects.prefetch_related("bullets").all()
    serializer_class = ExperienceSerializer


class CertificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer


def _fake_stream_response():
    """Return a fake 200 streaming response to waste bot time."""
    def fake_stream():
        yield f"data: {json.dumps({'token': 'Thanks for your message!'})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

    response = StreamingHttpResponse(fake_stream(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response


@require_POST
@ratelimit(key="ip", rate="10/h", block=True)
def chat_view(request):
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Honeypot check — bots auto-fill hidden fields, humans never see them
    if body.get("website"):
        return _fake_stream_response()

    # Timestamp challenge — reject requests from bots that fire instantly
    ts = body.get("_ts")
    if ts is None:
        return JsonResponse({"error": "Missing timestamp"}, status=400)
    try:
        ts = int(ts)
    except (TypeError, ValueError):
        return JsonResponse({"error": "Invalid timestamp"}, status=400)
    now_ms = int(time.time() * 1000)
    if now_ms - ts < _MIN_TIME_ON_PAGE_MS:
        return JsonResponse({"error": "Too fast"}, status=400)

    message = body.get("message", "").strip()
    if not message:
        return JsonResponse({"error": "Message is required"}, status=400)
    if len(message) > 500:
        return JsonResponse({"error": "Message too long (max 500 characters)"}, status=400)

    from .llm import stream_chat
    from .prompt import build_system_prompt

    system_prompt = build_system_prompt()

    def event_stream():        
        full_response = []
        try:
            for token in stream_chat(system_prompt, message):
                full_response.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"

            answer = "".join(full_response)
            done_data = {"done": True}
            if answer:
                try:
                    chat_log = ChatLog.objects.create(
                        question=message,
                        answer=answer,
                    )
                    done_data["chatlog_id"] = chat_log.id
                except Exception:
                    logger.exception("Failed to save chat log")
            logger.info("done_data: %s", done_data)
            yield f"data: {json.dumps(done_data)}\n\n"
        except Exception:
            logger.exception("LLM streaming error")
            yield f"data: {json.dumps({'error': 'Something went wrong. Please try again.'})}\n\n"

    response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response


@require_POST
@ratelimit(key="ip", rate="30/h", block=True)
def feedback_view(request):
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    chatlog_id = body.get("chatlog_id")
    feedback = body.get("feedback")

    if chatlog_id is None or feedback is None:
        return JsonResponse({"error": "chatlog_id and feedback are required"}, status=400)

    if not isinstance(feedback, bool):
        return JsonResponse({"error": "feedback must be a boolean"}, status=400)

    try:
        chat_log = ChatLog.objects.get(id=chatlog_id)
    except ChatLog.DoesNotExist:
        return JsonResponse({"error": "ChatLog not found"}, status=404)

    if chat_log.feedback is not None:
        return JsonResponse({"error": "Feedback already submitted"}, status=409)

    chat_log.feedback = feedback
    chat_log.save(update_fields=["feedback"])
    return JsonResponse({"ok": True})


