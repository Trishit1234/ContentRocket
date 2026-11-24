import json
import os
from unittest.mock import patch
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from urllib.error import URLError
from .views import IdeasOutput, gemini_json, ollama_json


class AIGenerationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='creator@example.test', password='TestPass-4321!')
        self.client.force_authenticate(self.user)

    @patch('ai_tools.views.generate_ai_json')
    def test_idea_generation_returns_validated_ideas(self, generate):
        generate.return_value = ({
            'ideas': [{
                'title': 'A guitar warm-up',
                'idea': 'Show three easy warm-ups.',
                'hook': 'Tune up in one minute.',
                'description': 'A beginner-friendly warm-up.',
                'format': 'Reel',
                'target_audience': 'New guitarists',
                'call_to_action': 'Save this routine.',
            }],
        }, None)

        response = self.client.post('/api/ideas/generate/', {
            'topic': 'Beginner guitar warm-ups',
            'platform': 'Instagram',
            'number': 1,
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['ideas']), 1)

    @patch('ai_tools.views.generate_ai_json')
    def test_script_generation_returns_structured_sections(self, generate):
        generate.return_value = ({
            'title': 'Tune a guitar',
            'opening_hook': 'Sound in tune in seconds.',
            'introduction': 'Start with the low E string.',
            'main_content': 'Match each string to the reference.',
            'scene_suggestions': ['Show the tuner display.'],
            'dialogue_or_narration': 'Turn the peg slowly.',
            'closing': 'Check each string once more.',
            'call_to_action': 'Follow for more tips.',
        }, None)

        response = self.client.post('/api/scripts/generate/', {
            'topic': 'How to tune a guitar',
            'platform': 'YouTube Shorts',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('opening_hook', response.data)
        self.assertIsInstance(response.data['scene_suggestions'], list)

    @patch('ai_tools.views.generate_ai_json')
    def test_caption_generation_returns_captions_and_actions(self, generate):
        generate.return_value = ({
            'captions': ['Start with one chord today.'],
            'hashtags': ['#Guitar'],
            'calls_to_action': ['Save this for practice.'],
            'hooks': ['One chord can start it all.'],
        }, None)

        response = self.client.post('/api/captions/generate/', {
            'topic': 'First guitar lesson',
            'platform': 'Instagram',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['calls_to_action'], ['Save this for practice.'])

    @patch('ai_tools.views.generate_ai_json')
    def test_invalid_idea_count_is_rejected_without_calling_gemini(self, generate):
        response = self.client.post('/api/ideas/generate/', {
            'topic': 'Beginner guitar warm-ups',
            'platform': 'Instagram',
            'number': 11,
        }, format='json')

        self.assertEqual(response.status_code, 400)
        generate.assert_not_called()

    def test_gemini_service_requests_and_validates_structured_output(self):
        response_data = {
            'ideas': [{
                'title': 'A guitar warm-up',
                'idea': 'Show three easy warm-ups.',
                'hook': 'Tune up in one minute.',
                'description': 'A beginner-friendly warm-up.',
                'format': 'Reel',
                'target_audience': 'New guitarists',
                'call_to_action': 'Save this routine.',
            }],
        }
        with patch.dict(os.environ, {'GEMINI_API_KEY': 'unit-test-key'}):
            with patch('ai_tools.views.genai.Client') as client_class:
                client = client_class.return_value
                client.interactions.create.return_value.output_text = json.dumps(response_data)

                result, error = gemini_json('Make an idea.', IdeasOutput)

        self.assertIsNone(error)
        self.assertEqual(result, response_data)
        request = client.interactions.create.call_args.kwargs
        self.assertEqual(request['model'], 'gemini-3.8-flash')
        self.assertFalse(request['store'])
        self.assertEqual(request['response_format']['mime_type'], 'application/json')
        client.close.assert_called_once()

    def test_ollama_service_sends_schema_and_validates_output(self):
        response_data = {
            'ideas': [{
                'title': 'A guitar warm-up',
                'idea': 'Show three easy warm-ups.',
                'hook': 'Tune up in one minute.',
                'description': 'A beginner-friendly warm-up.',
                'format': 'Reel',
                'target_audience': 'New guitarists',
                'call_to_action': 'Save this routine.',
            }],
        }
        with patch('ai_tools.views.urlopen') as ollama_response:
            ollama_response.return_value.__enter__.return_value.read.return_value = json.dumps({
                'message': {'content': json.dumps(response_data)},
            }).encode()
            with patch.dict(os.environ, {'OLLAMA_MODEL': 'test-model'}):
                result, error = ollama_json('Make an idea.', IdeasOutput)
            request = ollama_response.call_args.args[0]
            payload = json.loads(request.data)
        self.assertIsNone(error)
        self.assertEqual(result, response_data)
        self.assertEqual(payload['model'], 'test-model')
        self.assertEqual(payload['format'], IdeasOutput.model_json_schema())
        self.assertFalse(payload['stream'])

    def test_ollama_service_reports_when_local_server_is_offline(self):
        with patch('ai_tools.views.urlopen', side_effect=URLError('connection refused')):
            result, error = ollama_json('Make an idea.', IdeasOutput)

        self.assertIsNone(result)
        self.assertIn('Ollama is not running', error)
