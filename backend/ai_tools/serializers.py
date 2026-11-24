from rest_framework import serializers
from .models import ContentIdea, Script, Caption

class IdeaGenerationInputSerializer(serializers.Serializer):
    niche=serializers.CharField(max_length=100,required=False,allow_blank=True)
    platform=serializers.CharField(max_length=50)
    topic=serializers.CharField(max_length=500)
    target_audience=serializers.CharField(max_length=255,required=False,allow_blank=True)
    content_format=serializers.CharField(max_length=100,required=False,allow_blank=True)
    tone=serializers.CharField(max_length=100,required=False,allow_blank=True)
    number=serializers.IntegerField(min_value=1,max_value=10,default=5)

class ScriptGenerationInputSerializer(serializers.Serializer):
    platform=serializers.CharField(max_length=100)
    topic=serializers.CharField(max_length=500)
    duration=serializers.CharField(max_length=50,required=False,allow_blank=True)
    style=serializers.CharField(max_length=100,required=False,allow_blank=True)
    tone=serializers.CharField(max_length=100,required=False,allow_blank=True)
    target_audience=serializers.CharField(max_length=255,required=False,allow_blank=True)
    language=serializers.CharField(max_length=50,default='English')
    additional_instructions=serializers.CharField(max_length=1000,required=False,allow_blank=True)

class CaptionGenerationInputSerializer(serializers.Serializer):
    topic=serializers.CharField(max_length=500)
    platform=serializers.CharField(max_length=50)
    tone=serializers.CharField(max_length=100,required=False,allow_blank=True)
    length=serializers.ChoiceField(choices=('Short','Medium','Long'),default='Medium')
    keywords=serializers.CharField(max_length=500,required=False,allow_blank=True)
    language=serializers.CharField(max_length=50,default='English')

class IdeaOutputSerializer(serializers.Serializer):
    title=serializers.CharField()
    idea=serializers.CharField()
    hook=serializers.CharField()
    description=serializers.CharField()
    format=serializers.CharField()
    target_audience=serializers.CharField()
    call_to_action=serializers.CharField()

class IdeasOutputSerializer(serializers.Serializer):
    ideas=IdeaOutputSerializer(many=True)

class ScriptOutputSerializer(serializers.Serializer):
    title=serializers.CharField()
    opening_hook=serializers.CharField()
    introduction=serializers.CharField()
    main_content=serializers.CharField()
    scene_suggestions=serializers.ListField(child=serializers.CharField())
    dialogue_or_narration=serializers.CharField()
    closing=serializers.CharField()
    call_to_action=serializers.CharField()

class CaptionsOutputSerializer(serializers.Serializer):
    captions=serializers.ListField(child=serializers.CharField(),allow_empty=False)
    hashtags=serializers.ListField(child=serializers.CharField())
    calls_to_action=serializers.ListField(child=serializers.CharField())
    hooks=serializers.ListField(child=serializers.CharField())

class ContentIdeaSerializer(serializers.ModelSerializer):
    class Meta:
        model=ContentIdea
        fields='__all__'
        read_only_fields=('id','user','created_at','updated_at')

class ScriptSerializer(serializers.ModelSerializer):
    class Meta:
        model=Script
        fields='__all__'
        read_only_fields=('id','user','created_at','updated_at')

class CaptionSerializer(serializers.ModelSerializer):
    class Meta:
        model=Caption
        fields='__all__'
        read_only_fields=('id','user','created_at','updated_at')
