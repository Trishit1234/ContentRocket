from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Competitor,CompetitorObservation
from .serializers import CompetitorSerializer,CompetitorObservationSerializer
class CompetitorViewSet(viewsets.ModelViewSet):
 queryset=Competitor.objects.all();serializer_class=CompetitorSerializer;permission_classes=(IsAuthenticated,)
 def get_queryset(self):return self.queryset.filter(user=self.request.user)
 def perform_create(self,serializer):serializer.save(user=self.request.user)
class ObservationViewSet(viewsets.ModelViewSet):
 queryset=CompetitorObservation.objects.all();serializer_class=CompetitorObservationSerializer;permission_classes=(IsAuthenticated,)
 def get_queryset(self):return self.queryset.filter(competitor__user=self.request.user)
