from rest_framework import serializers
from .models import ContentPost
class ContentPostSerializer(serializers.ModelSerializer):
 class Meta:
  model=ContentPost
  fields='__all__'
  read_only_fields=('id','user','created_at','updated_at')
