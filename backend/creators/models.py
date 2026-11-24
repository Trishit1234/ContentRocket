from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings


class CreatorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='creator_profile')
    creator_name = models.CharField(max_length=150)
    niche = models.CharField(max_length=100, blank=True)
    primary_platform = models.CharField(max_length=50, blank=True)
    content_type = models.CharField(max_length=100, blank=True)
    target_audience = models.CharField(max_length=255, blank=True)
    preferred_tone = models.CharField(max_length=100, blank=True)
    main_goal = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.URLField(blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    ai_preferences = models.JSONField(default=dict, blank=True)
    theme_preference = models.CharField(max_length=20, default='light')
    notification_preferences = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
