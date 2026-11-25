from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAuthenticated
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
        return Response({'status': 'ok', 'service': 'ContentRocket API'})


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
        recent_assets = ContentAsset.objects.filter(user=user).order_by('-updated_at')[:5]
        recent_content = [
            (post.updated_at, {'id': f'post-{post.id}', 'title': post.title, 'platform': post.platform, 'status': post.status, 'path': '/app/calendar'})
            for post in recent_posts
        ] + [
            (asset.updated_at, {'id': f'asset-{asset.id}', 'title': asset.title, 'platform': asset.category or 'Saved content', 'status': asset.asset_type, 'path': '/app/library'})
            for asset in recent_assets
        ]
        recent_content.sort(key=lambda entry: entry[0], reverse=True)
        upcoming_posts = upcoming[:5]
        performance = ContentPerformance.objects.filter(user=user)
        return Response({
            'total_content': total_content,
            'upcoming_posts': upcoming.count(),
            'completed_tasks': Task.objects.filter(user=user, status='Completed').count(),
            'total_views': sum(performance.values_list('views', flat=True)),
            'recent_content': [item for _, item in recent_content[:5]],
            'upcoming_deadlines': [
                {'id': post.id, 'title': post.title, 'date': post.scheduled_date}
                for post in upcoming_posts
            ],
        })
