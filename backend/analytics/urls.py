from rest_framework.routers import DefaultRouter
from .views import ContentPerformanceViewSet
router=DefaultRouter();router.register(r'performance',ContentPerformanceViewSet,basename='performance');urlpatterns=router.urls
