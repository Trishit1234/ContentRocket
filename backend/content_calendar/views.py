from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ContentPost
from .serializers import ContentPostSerializer
class ContentPostViewSet(viewsets.ModelViewSet):
 queryset=ContentPost.objects.all();serializer_class=ContentPostSerializer;permission_classes=(IsAuthenticated,)
 def get_queryset(self):return self.queryset.filter(user=self.request.user)
 def perform_create(self,serializer):serializer.save(user=self.request.user)
