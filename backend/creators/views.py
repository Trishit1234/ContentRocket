from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import CreatorProfile
from .serializers import CreatorProfileSerializer


class CreatorProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CreatorProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return CreatorProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
