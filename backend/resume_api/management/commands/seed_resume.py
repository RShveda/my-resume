from datetime import date

from django.core.management.base import BaseCommand

from resume_api.models import Certification, Experience, ExperienceBullet, Skill


class Command(BaseCommand):
    help = "Seed the database with resume data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-input",
            action="store_true",
            help="Skip if data already exists",
        )

    def handle(self, *args, **options):
        if options["no_input"] and Skill.objects.exists():
            self.stdout.write("Data already exists, skipping seed.")
            return

        self._seed_skills()
        self._seed_experience()
        self._seed_certifications()
        self.stdout.write(self.style.SUCCESS("Resume data seeded successfully."))

    def _seed_skills(self):
        Skill.objects.all().delete()
        skills = [
            ("Python", "Programming", 1),
            ("JavaScript", "Programming", 2),
            ("SQL", "Programming", 3),
            ("XML", "Programming", 4),
            ("Odoo ERP", "Frameworks", 1),
            ("Django", "Frameworks", 2),
            ("React", "Frameworks", 3),
            ("aiohttp", "Frameworks", 4),
            ("RESTful APIs", "Frameworks", 5),
            ("HTML", "Frameworks", 6),
            ("CSS", "Frameworks", 7),
            ("PostgreSQL", "Databases", 1),
            ("MySQL", "Databases", 2),
            ("MongoDB", "Databases", 3),
            ("Redis", "Databases", 4),
            ("Docker", "DevOps", 1),
            ("Kubernetes", "DevOps", 2),
            ("CI/CD", "DevOps", 3),
            ("Git", "DevOps", 4),
            ("GitHub Actions", "DevOps", 5),
            ("GitLab CI", "DevOps", 6),
            ("Google Cloud Platform", "DevOps", 7),
            ("Heroku", "DevOps", 8),
            ("Claude", "AI", 1),
            ("GitHub Copilot", "AI", 2),
            ("Agile", "Methodologies", 1),
            ("Scrum", "Methodologies", 2),
            ("DevOps", "Methodologies", 3),
        ]
        Skill.objects.bulk_create(
            [Skill(name=name, category=cat, order=order) for name, cat, order in skills]
        )

    def _seed_experience(self):
        Experience.objects.all().delete()

        # HTS
        hts = Experience.objects.create(
            company="HTS",
            role="Senior Software Engineer",
            start_date=date(2022, 11, 1),
            end_date=None,
            location="Remote",
            is_remote=True,
            order=1,
        )
        hts_bullets = [
            "Led enterprise application migration from legacy version to latest release using open-source migration framework, ensuring data integrity for critical financial and contact records across multi-version upgrade",
            "Developed custom migration application that streamlined onboarding of 5 new hotel properties, reducing manual configuration time and accelerating time-to-market",
            "Built automated financial reporting system aggregating data from POS, Reservations, and Sales streams, reducing manual reconciliation time for hotel accounting teams",
            "Introduced code review and unit testing practices within the development team, establishing higher quality standards and reducing production-level bugs",
            "Led technical interviews and created structured onboarding documentation, reducing ramp-up time for new engineering team members",
            "Managed and maintained cloud infrastructure on GCP, ensuring 99.5% uptime while monitoring system performance and operational costs during client expansion",
        ]
        ExperienceBullet.objects.bulk_create(
            [
                ExperienceBullet(experience=hts, text=text, order=i)
                for i, text in enumerate(hts_bullets, 1)
            ]
        )

        # Bytebrand
        bb = Experience.objects.create(
            company="Bytebrand Outsourcing AG",
            role="Software Engineer",
            start_date=date(2020, 11, 1),
            end_date=date(2022, 11, 1),
            location="Remote",
            is_remote=True,
            order=2,
        )
        bb_bullets = [
            "Achieved 10x performance gains in mission-critical operations (automated invoice creation, report generation) by profiling Python code and resolving architectural bottlenecks",
            "Advocated for and implemented open-source migration framework to rescue a failing enterprise application upgrade for a key client",
            "Introduced CI/CD via GitLab CI, streamlining the deployment process and improving code stability across various production environments",
            "Maintained and expanded 20+ custom application modules, including backend REST API for web booking engine and complex POS customizations",
            "Built Python-based automated synchronization tool to scrape and update real-time pricing data from external services, eliminating manual data entry and ensuring price parity across platforms",
        ]
        ExperienceBullet.objects.bulk_create(
            [
                ExperienceBullet(experience=bb, text=text, order=i)
                for i, text in enumerate(bb_bullets, 1)
            ]
        )

        # ArtfulBits
        ab = Experience.objects.create(
            company="ArtfulBits",
            role="Technical Project Manager / Scrum Master",
            start_date=date(2015, 11, 1),
            end_date=date(2020, 11, 1),
            location="",
            is_remote=False,
            order=3,
        )
        ab_bullets = [
            "Managed end-to-end software development projects with teams up to 10 members, from requirements gathering through final delivery, consistently achieving project objectives and client satisfaction",
            "Led Scrum ceremonies and implemented Agile best practices, improving team velocity by 25% and project delivery success rate",
            "Recruited and developed high-performing Agile teams, establishing effective collaboration processes and fostering professional development",
            "Bridged communication between technical teams and stakeholders, translating business requirements into technical specifications and ensuring alignment on project goals",
            "Built strong client relationships and maintained high account retention through effective communication and consistent delivery of quality solutions",
        ]
        ExperienceBullet.objects.bulk_create(
            [
                ExperienceBullet(experience=ab, text=text, order=i)
                for i, text in enumerate(ab_bullets, 1)
            ]
        )

    def _seed_certifications(self):
        Certification.objects.all().delete()
        certs = [
            ("The Complete JavaScript Course 2025: From Zero to Expert", "Udemy", None, 1),
            ("Python and Django Full Stack Web Developer Bootcamp", "Udemy", None, 2),
            ("Professional Scrum Master I (PSM I)", "", None, 3),
            ("CS50: Introduction to Computer Science", "Harvard University (Prometheus)", None, 4),
            ("Implement DevOps in Google Cloud", "Google Cloud", None, 5),
            ("Introduction to Generative AI", "Google", None, 6),
            ("Introduction to Kubernetes", "The Linux Foundation (Prometheus)", None, 7),
        ]
        Certification.objects.bulk_create(
            [
                Certification(name=name, issuer=issuer, year=year, order=order)
                for name, issuer, year, order in certs
            ]
        )
