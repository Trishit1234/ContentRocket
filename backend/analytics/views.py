from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ContentPerformance
from .serializers import ContentPerformanceSerializer
class ContentPerformanceViewSet(viewsets.ModelViewSet):
 queryset=ContentPerformance.objects.all();serializer_class=ContentPerformanceSerializer;permission_classes=(IsAuthenticated,)
 def get_queryset(self):return self.queryset.filter(user=self.request.user)
 def perform_create(self,serializer):serializer.save(user=self.request.user)
