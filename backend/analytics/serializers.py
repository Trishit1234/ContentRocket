from rest_framework import serializers
from .models import ContentPerformance
class ContentPerformanceSerializer(serializers.ModelSerializer):
 engagement_rate=serializers.ReadOnlyField()
 class Meta:
  model=ContentPerformance
  fields='__all__'
  read_only_fields=('id','user','created_at','updated_at')
