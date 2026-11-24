from rest_framework import serializers
from .models import Competitor,CompetitorObservation
class CompetitorObservationSerializer(serializers.ModelSerializer):
 class Meta:
  model=CompetitorObservation
  fields='__all__'
class CompetitorSerializer(serializers.ModelSerializer):
 observations=CompetitorObservationSerializer(many=True,read_only=True)
 class Meta:
  model=Competitor
  fields='__all__'
  read_only_fields=('id','user','created_at','updated_at')
