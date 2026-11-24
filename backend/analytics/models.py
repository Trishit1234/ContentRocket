from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models


class ContentPerformance(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='content_performance')
    platform=models.CharField(max_length=50)
    content_title=models.CharField(max_length=255)
    views=models.PositiveIntegerField(default=0)
    likes=models.PositiveIntegerField(default=0)
    comments=models.PositiveIntegerField(default=0)
    shares=models.PositiveIntegerField(default=0)
    saves=models.PositiveIntegerField(default=0)
    followers_gained=models.IntegerField(default=0)
    publication_date=models.DateField()
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    @property
    def engagement_rate(self):
        return round(((self.likes+self.comments+self.shares+self.saves)/self.views*100),2) if self.views else 0
