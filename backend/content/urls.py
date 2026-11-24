from rest_framework.routers import DefaultRouter
from .views import ContentAssetViewSet
router=DefaultRouter();router.register(r'assets',ContentAssetViewSet,basename='assets');urlpatterns=router.urls
