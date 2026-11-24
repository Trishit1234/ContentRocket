

# Create your views here.
import os
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from google import genai
from google.genai import errors
from google.genai._interactions import (
    APIError as InteractionAPIError,
    AuthenticationError,
    NotFoundError,
    PermissionDeniedError,
    RateLimitError,
)
from pydantic import BaseModel, ValidationError
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.response import Response
from .models import ContentIdea, Script, Caption
from .serializers import (
    ContentIdeaSerializer, ScriptSerializer, CaptionSerializer,
    IdeaGenerationInputSerializer, ScriptGenerationInputSerializer,
    CaptionGenerationInputSerializer, IdeasOutputSerializer,
    ScriptOutputSerializer, CaptionsOutputSerializer,
)

class IdeaOutput(BaseModel):
    title: str
    idea: str
    hook: str
    description: str
    format: str
    target_audience: str
    call_to_action: str

class IdeasOutput(BaseModel):
    ideas: list[IdeaOutput]

class ScriptOutput(BaseModel):
    title: str
    opening_hook: str
    introduction: str
    main_content: str
    scene_suggestions: list[str]
    dialogue_or_narration: str
    closing: str
    call_to_action: str

class CaptionsOutput(BaseModel):
    captions: list[str]
    hashtags: list[str]
    calls_to_action: list[str]
    hooks: list[str]


def ollama_json(prompt, response_schema):
    base_url = os.getenv('OLLAMA_BASE_URL', 'http://127.0.0.1:11434').rstrip('/')
    model = os.getenv('OLLAMA_MODEL', 'gemma4')
    request = Request(
        f'{base_url}/api/chat',
        data=json.dumps({
            'model': model,
            'messages': [{'role': 'user', 'content': prompt}],
            'stream': False,
            'format': response_schema.model_json_schema(),
        }).encode(),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urlopen(request, timeout=120) as response:
            result = json.loads(response.read().decode())
        content = result['message']['content']
        return response_schema.model_validate_json(content).model_dump(), None
    except HTTPError as exc:
        if exc.code == 404:
            return None, f'Ollama model "{model}" is not available. Run "ollama run {model}" to download it.'
        return None, f'Ollama request failed with HTTP {exc.code}.'
    except URLError:
        return None, 'Ollama is not running. Install and start Ollama, then run "ollama run gemma4".'
    except TimeoutError:
        return None, 'The local model took too long to respond. Try a smaller model or try again.'
    except (KeyError, json.JSONDecodeError, ValidationError):
        return None, 'Ollama returned content in an unexpected format.'


def gemini_json(prompt, response_schema):
    key_value = os.getenv('GEMINI_API_KEYS') or os.getenv('GEMINI_API_KEY')
    if not key_value:
        return None, 'Gemini API key is not configured. Add GEMINI_API_KEY to backend/.env.'

    keys = [key.strip() for key in key_value.split(',') if key.strip()]
    model_value = os.getenv('GEMINI_MODELS') or os.getenv('GEMINI_MODEL', 'gemini-3.8-flash')
    models = [model.strip() for model in model_value.split(',') if model.strip()]
    rate_limited = False
    last_error = None

    for key in keys:
        for model in models:
            client = genai.Client(
                api_key=key,
                http_options={'timeout': 30000, 'retry_options': {'attempts': 1}},
            )
            try:
                interaction = client.interactions.create(
                    model=model,
                    input=prompt,
                    store=False,
                    response_format={
                        'type': 'text',
                        'mime_type': 'application/json',
                        'schema': response_schema.model_json_schema(),
                    },
                )
                if not interaction.output_text:
                    last_error = 'Gemini returned an empty response.'
                    continue
                return response_schema.model_validate_json(interaction.output_text).model_dump(), None
            except (errors.APIError, InteractionAPIError) as exc:
                status_code = getattr(exc, 'status_code', getattr(exc, 'code', None))
                if isinstance(exc, RateLimitError) or status_code == 429:
                    rate_limited = True
                    last_error = 'Gemini usage limit reached for this API key. Trying the next configured key or model.'
                    continue
                if isinstance(exc, (AuthenticationError, PermissionDeniedError)) or status_code in (401, 403):
                    last_error = 'Gemini rejected an API key. Replace GEMINI_API_KEY or GEMINI_API_KEYS in Render.'
                    continue
                if isinstance(exc, NotFoundError) or status_code == 404:
                    last_error = f'Gemini model "{model}" is unavailable. Trying the next configured model.'
                    continue
                if status_code == 503:
                    last_error = 'Gemini is temporarily busy or at capacity. Trying the next configured model.'
                    continue
                last_error = f'Gemini request failed with HTTP {status_code or "error"}.'
            except (ValidationError, json.JSONDecodeError):
                last_error = 'Gemini returned content in an unexpected format.'
            finally:
                client.close()

    if rate_limited:
        return None, 'All configured Gemini keys/models have reached usage limits. Add another key or enable paid quota.'
    return None, last_error or 'Gemini request failed.'


def generate_ai_json(prompt, response_schema):
    provider = os.getenv('AI_PROVIDER', 'ollama').lower()
    if provider == 'ollama':
        return ollama_json(prompt, response_schema)
    if provider == 'gemini':
        return gemini_json(prompt, response_schema)
    return None, 'AI_PROVIDER must be set to "ollama" or "gemini".'


class OwnedViewSet(viewsets.ModelViewSet):
    def get_queryset(self):return self.queryset.filter(user=self.request.user)
    def perform_create(self,serializer):serializer.save(user=self.request.user)

class IdeaViewSet(OwnedViewSet):
    queryset=ContentIdea.objects.all()
    serializer_class=ContentIdeaSerializer
    @action(detail=False,methods=['post'],throttle_classes=[ScopedRateThrottle])
    def generate(self,request):
        input_serializer=IdeaGenerationInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        d=input_serializer.validated_data
        prompt=f"Generate exactly {d['number']} content ideas for niche={d.get('niche','')}, platform={d['platform']}, topic={d['topic']}, audience={d.get('target_audience','')}, format={d.get('content_format','')}, tone={d.get('tone','')}. Include an actionable title, original idea, opening hook, concise description, suggested format, target audience, and call to action."
        data,error=generate_ai_json(prompt,IdeasOutput)
        if error:return Response({'detail':error},status=status.HTTP_503_SERVICE_UNAVAILABLE)
        output=IdeasOutputSerializer(data=data)
        if not output.is_valid():return Response({'detail':'Gemini returned content in an unexpected format.'},status=status.HTTP_502_BAD_GATEWAY)
        return Response(output.validated_data)

class ScriptViewSet(OwnedViewSet):
    queryset=Script.objects.all()
    serializer_class=ScriptSerializer
    @action(detail=False,methods=['post'],throttle_classes=[ScopedRateThrottle])
    def generate(self,request):
        input_serializer=ScriptGenerationInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        d=input_serializer.validated_data
        prompt=f"Create a structured {d.get('duration','')} script in {d.get('language','English')} for platform={d['platform']}, topic={d['topic']}, style={d.get('style','')}, tone={d.get('tone','')}, audience={d.get('target_audience','')}. Additional instructions: {d.get('additional_instructions','')}. Provide narration and practical scenes."
        data,error=generate_ai_json(prompt,ScriptOutput)
        if error:return Response({'detail':error},status=status.HTTP_503_SERVICE_UNAVAILABLE)
        output=ScriptOutputSerializer(data=data)
        if not output.is_valid():return Response({'detail':'Gemini returned content in an unexpected format.'},status=status.HTTP_502_BAD_GATEWAY)
        return Response(output.validated_data)

class CaptionViewSet(OwnedViewSet):
    queryset=Caption.objects.all()
    serializer_class=CaptionSerializer
    @action(detail=False,methods=['post'],throttle_classes=[ScopedRateThrottle])
    def generate(self,request):
        input_serializer=CaptionGenerationInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        d=input_serializer.validated_data
        prompt=f"Generate 3 caption alternatives in {d.get('language','English')} for topic={d['topic']}, platform={d['platform']}, tone={d.get('tone','')}, length={d.get('length','Medium')}, keywords={d.get('keywords','')}. Also provide relevant non-guaranteed hashtags, calls to action, and alternative hooks."
        data,error=generate_ai_json(prompt,CaptionsOutput)
        if error:return Response({'detail':error},status=status.HTTP_503_SERVICE_UNAVAILABLE)
        output=CaptionsOutputSerializer(data=data)
        if not output.is_valid():return Response({'detail':'Gemini returned content in an unexpected format.'},status=status.HTTP_502_BAD_GATEWAY)
        return Response(output.validated_data)
