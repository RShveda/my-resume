from django.db import models


class Skill(models.Model):
    CATEGORY_CHOICES = [
        ("Programming", "Programming"),
        ("Frameworks", "Frameworks & Technologies"),
        ("Databases", "Databases"),
        ("DevOps", "DevOps & Cloud"),
        ("AI", "AI-Assisted Development"),
        ("Methodologies", "Methodologies"),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.name} ({self.category})"


class Experience(models.Model):
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    is_remote = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.role} at {self.company}"


class ExperienceBullet(models.Model):
    experience = models.ForeignKey(
        Experience, on_delete=models.CASCADE, related_name="bullets"
    )
    text = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.text[:80]


class Certification(models.Model):
    name = models.CharField(max_length=300)
    issuer = models.CharField(max_length=200, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name
