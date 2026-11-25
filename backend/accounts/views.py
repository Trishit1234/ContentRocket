from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, MeSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': MeSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=201)


class MeView(APIView):
    def get(self, request):
        return Response(MeSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = str(request.data.get('email', '')).strip()
        if not email:
            return Response({'email': ['Enter your email address.']}, status=400)

        user_model = get_user_model()
        users = user_model.objects.filter(email__iexact=email, is_active=True)
        debug_url = None
        for user in users:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password/{uid}/{token}"
            send_mail(
                'Reset your ContentRocket password',
                f'Use this link to choose a new password: {reset_url}\n\nIf you did not request this, ignore this email.',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            if settings.DEBUG and settings.EMAIL_BACKEND.endswith('.console.EmailBackend'):
                debug_url = reset_url

        response = {'detail': 'If an account matches that email, password reset instructions have been sent.'}
        if debug_url:
            response['debug_reset_url'] = debug_url
        return Response(response)


class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password', '')
        if not uid or not token or not password:
            return Response({'detail': 'The reset link or new password is missing.'}, status=400)
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = get_user_model().objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            return Response({'detail': 'This reset link is invalid or has expired.'}, status=400)
        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'This reset link is invalid or has expired.'}, status=400)
        try:
            validate_password(password, user)
        except ValidationError as error:
            return Response({'password': list(error.messages)}, status=400)
        user.set_password(password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Password updated. You can now log in.'})
