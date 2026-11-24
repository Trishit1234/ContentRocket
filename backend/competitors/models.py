from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models


class Competitor(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='competitors')
    name=models.CharField(max_length=255)
    platform=models.CharField(max_length=50)
    profile_url=models.URLField(blank=True)
    niche=models.CharField(max_length=100,blank=True)
    notes=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)


class CompetitorObservation(models.Model):
    competitor=models.ForeignKey(Competitor,on_delete=models.CASCADE,related_name='observations')
    content_title=models.CharField(max_length=255)
    content_url=models.URLField(blank=True)
    views=models.PositiveIntegerField(default=0)
    likes=models.PositiveIntegerField(default=0)
    comments=models.PositiveIntegerField(default=0)
    content_format=models.CharField(max_length=100,blank=True)
    date_observed=models.DateField()
