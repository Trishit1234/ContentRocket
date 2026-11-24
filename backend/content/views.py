from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ContentAsset
from .serializers import ContentAssetSerializer
class ContentAssetViewSet(viewsets.ModelViewSet):
 queryset=ContentAsset.objects.all();serializer_class=ContentAssetSerializer;permission_classes=(IsAuthenticated,)
 def get_queryset(self):return self.queryset.filter(user=self.request.user)
 def perform_create(self,serializer):serializer.save(user=self.request.user)
