from rest_framework import serializers
from .models import ContentAsset
class ContentAssetSerializer(serializers.ModelSerializer):
 class Meta:
  model=ContentAsset
  fields='__all__'
  read_only_fields=('id','user','created_at','updated_at')
