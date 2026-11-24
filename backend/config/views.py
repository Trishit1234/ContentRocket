from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from ai_tools.models import Caption, ContentIdea, Script
from analytics.models import ContentPerformance
from content.models import ContentAsset
from content_calendar.models import ContentPost
from tasks.models import Task


class HealthView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response({
            'status': 'ok',
            'service': 'ContentRocket API',
        })


class DashboardSummaryView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        today = timezone.localdate()
        posts = ContentPost.objects.filter(user=user)
        upcoming = posts.filter(scheduled_date__gte=today).exclude(status='Published').order_by('scheduled_date', 'scheduled_time')
        total_content = (
            ContentAsset.objects.filter(user=user).count()
            + ContentIdea.objects.filter(user=user).count()
            + Script.objects.filter(user=user).count()
            + Caption.objects.filter(user=user).count()
            + posts.count()
        )
        recent_posts = posts.order_by('-updated_at')[:5]
        upcoming_posts = upcoming[:5]
        performance = ContentPerformance.objects.filter(user=user)
        return Response({
            'total_content': total_content,
            'upcoming_posts': upcoming.count(),
            'completed_tasks': Task.objects.filter(user=user, status='Completed').count(),
            'total_views': sum(performance.values_list('views', flat=True)),
            'recent_content': [
                {'id': post.id, 'title': post.title, 'platform': post.platform, 'status': post.status}
                for post in recent_posts
            ],
            'upcoming_deadlines': [
                {'id': post.id, 'title': post.title, 'date': post.scheduled_date}
                for post in upcoming_posts
            ],
        })
