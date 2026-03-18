import json
import logging

from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django_ratelimit.decorators import ratelimit
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Certification, ChatLog, Experience, Skill
from .serializers import CertificationSerializer, ExperienceSerializer, SkillSerializer

logger = logging.getLogger(__name__)


@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok"})


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer


class ExperienceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Experience.objects.prefetch_related("bullets").all()
    serializer_class = ExperienceSerializer


class CertificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer


@csrf_exempt
@require_POST
@ratelimit(key="ip", rate="10/h", block=True)
def chat_view(request):
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    message = body.get("message", "").strip()
    if not message:
        return JsonResponse({"error": "Message is required"}, status=400)
    if len(message) > 500:
        return JsonResponse({"error": "Message too long (max 500 characters)"}, status=400)

    ip = _get_client_ip(request)

    from .llm import stream_chat
    from .prompt import build_system_prompt

    system_prompt = build_system_prompt()

    def event_stream():
        full_response = []
        try:
            for token in stream_chat(system_prompt, message):
                full_response.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception:
            logger.exception("LLM streaming error")
            yield f"data: {json.dumps({'error': 'Something went wrong. Please try again.'})}\n\n"
        finally:
            answer = "".join(full_response)
            if answer:
                try:
                    ChatLog.objects.create(
                        question=message,
                        answer=answer,
                        ip_address=ip,
                    )
                except Exception:
                    logger.exception("Failed to save chat log")

    response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response


def _get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
