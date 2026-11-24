from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models


class ContentPost(models.Model):
    STATUS_CHOICES=[('Idea','Idea'),('Draft','Draft'),('In Progress','In Progress'),('Ready','Ready'),('Scheduled','Scheduled'),('Published','Published')]
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='content_posts')
    title=models.CharField(max_length=255)
    platform=models.CharField(max_length=50)
    scheduled_date=models.DateField()
    scheduled_time=models.TimeField(null=True,blank=True)
    content_type=models.CharField(max_length=100,blank=True)
    description=models.TextField(blank=True)
    status=models.CharField(max_length=20,choices=STATUS_CHOICES,default='Idea')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
