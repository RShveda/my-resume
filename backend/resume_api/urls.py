from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"skills", views.SkillViewSet)
router.register(r"experience", views.ExperienceViewSet)
router.register(r"certifications", views.CertificationViewSet)

urlpatterns = [
    path("health/", views.health_check, name="health-check"),
    path("", include(router.urls)),
]
