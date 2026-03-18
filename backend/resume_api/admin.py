from django.contrib import admin

from .models import Certification, ChatLog, Experience, ExperienceBullet, Skill


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "order")
    list_filter = ("category",)
    list_editable = ("order",)


class ExperienceBulletInline(admin.TabularInline):
    model = ExperienceBullet
    extra = 1


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("role", "company", "start_date", "end_date", "order")
    list_editable = ("order",)
    inlines = [ExperienceBulletInline]


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ("name", "issuer", "year", "order")
    list_editable = ("order",)


@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    list_display = ("short_question", "ip_address", "created_at")
    list_filter = ("created_at",)
    search_fields = ("question", "answer")
    readonly_fields = ("question", "answer", "ip_address", "created_at")

    def short_question(self, obj):
        return obj.question[:80]

    short_question.short_description = "Question"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
