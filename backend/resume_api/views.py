from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Certification, Experience, Skill
from .serializers import CertificationSerializer, ExperienceSerializer, SkillSerializer


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
