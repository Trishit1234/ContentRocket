from rest_framework.routers import DefaultRouter
from .views import ContentPostViewSet
router=DefaultRouter();router.register(r'posts',ContentPostViewSet,basename='posts');urlpatterns=router.urls
