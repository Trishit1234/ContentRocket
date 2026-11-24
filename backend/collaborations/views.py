from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Brand
from .serializers import BrandSerializer
class BrandViewSet(viewsets.ModelViewSet):
 queryset=Brand.objects.all();serializer_class=BrandSerializer;permission_classes=(IsAuthenticated,)
 def get_queryset(self):return self.queryset.filter(user=self.request.user)
 def perform_create(self,serializer):serializer.save(user=self.request.user)
