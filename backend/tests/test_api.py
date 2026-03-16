import pytest
from django.test import Client


@pytest.mark.django_db
class TestHealthEndpoint:
    def test_health_check_returns_ok(self):
        client = Client()
        response = client.get("/api/health/")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


@pytest.mark.django_db
class TestSkillsAPI:
    def test_list_skills_empty(self):
        client = Client()
        response = client.get("/api/skills/")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_skills_with_data(self):
        from resume_api.models import Skill

        Skill.objects.create(name="Python", category="Programming", order=1)
        Skill.objects.create(name="Django", category="Frameworks", order=1)

        client = Client()
        response = client.get("/api/skills/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "Django"  # ordered by order, then name


@pytest.mark.django_db
class TestExperienceAPI:
    def test_list_experience_empty(self):
        client = Client()
        response = client.get("/api/experience/")
        assert response.status_code == 200
        assert response.json() == []

    def test_experience_includes_bullets(self):
        from datetime import date

        from resume_api.models import Experience, ExperienceBullet

        exp = Experience.objects.create(
            company="TestCo",
            role="Developer",
            start_date=date(2020, 1, 1),
            order=1,
        )
        ExperienceBullet.objects.create(experience=exp, text="Did something", order=1)

        client = Client()
        response = client.get("/api/experience/")
        data = response.json()
        assert len(data) == 1
        assert len(data[0]["bullets"]) == 1
        assert data[0]["bullets"][0]["text"] == "Did something"


@pytest.mark.django_db
class TestCertificationsAPI:
    def test_list_certifications_empty(self):
        client = Client()
        response = client.get("/api/certifications/")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_certifications_with_data(self):
        from resume_api.models import Certification

        Certification.objects.create(name="PSM I", issuer="Scrum.org", order=1)

        client = Client()
        response = client.get("/api/certifications/")
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "PSM I"
