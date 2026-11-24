from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models


class Task(models.Model):
    STATUS_CHOICES=[('To Do','To Do'),('In Progress','In Progress'),('Completed','Completed')]
    PRIORITY_CHOICES=[('Low','Low'),('Medium','Medium'),('High','High')]
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='tasks')
    title=models.CharField(max_length=255)
    description=models.TextField(blank=True)
    deadline=models.DateField(null=True,blank=True)
    priority=models.CharField(max_length=10,choices=PRIORITY_CHOICES,default='Medium')
    status=models.CharField(max_length=20,choices=STATUS_CHOICES,default='To Do')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
