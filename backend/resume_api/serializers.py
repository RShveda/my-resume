from rest_framework import serializers

from .models import Certification, Experience, ExperienceBullet, Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category", "order"]


class ExperienceBulletSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceBullet
        fields = ["id", "text", "order"]


class ExperienceSerializer(serializers.ModelSerializer):
    bullets = ExperienceBulletSerializer(many=True, read_only=True)

    class Meta:
        model = Experience
        fields = [
            "id",
            "company",
            "role",
            "start_date",
            "end_date",
            "location",
            "is_remote",
            "order",
            "bullets",
        ]


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ["id", "name", "issuer", "year", "order"]
