from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models


class ContentIdea(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='content_ideas')
    title = models.CharField(max_length=255)
    idea = models.TextField()
    hook = models.TextField(blank=True)
    description = models.TextField(blank=True)
    format = models.CharField(max_length=100, blank=True)
    platform = models.CharField(max_length=50, blank=True)
    target_audience = models.CharField(max_length=255, blank=True)
    call_to_action = models.CharField(max_length=255, blank=True)
    favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Script(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='scripts')
    title = models.CharField(max_length=255)
    content = models.JSONField(default=dict)
    platform = models.CharField(max_length=50, blank=True)
    topic = models.CharField(max_length=255, blank=True)
    favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Caption(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='captions')
    topic = models.CharField(max_length=255)
    captions = models.JSONField(default=list)
    hashtags = models.JSONField(default=list)
    calls_to_action = models.JSONField(default=list)
    hooks = models.JSONField(default=list)
    favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
