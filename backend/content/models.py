from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models


class ContentAsset(models.Model):
    TYPE_CHOICES = [('idea','Idea'),('script','Script'),('caption','Caption'),('draft','Draft'),('reference','Content reference')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='content_assets')
    title = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    body = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
