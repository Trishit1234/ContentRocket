from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models


class Brand(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='brands')
    brand_name=models.CharField(max_length=255)
    contact_person=models.CharField(max_length=255,blank=True)
    email=models.EmailField(blank=True)
    campaign_title=models.CharField(max_length=255,blank=True)
    deal_amount=models.DecimalField(max_digits=12,decimal_places=2,default=0)
    platform=models.CharField(max_length=50,blank=True)
    deadline=models.DateField(null=True,blank=True)
    notes=models.TextField(blank=True)
    payment_status=models.CharField(max_length=20,default='Pending')
    collaboration_status=models.CharField(max_length=20,default='Lead')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
