from rest_framework.routers import DefaultRouter
from .views import CreatorProfileViewSet

router = DefaultRouter()
router.register(r'profile', CreatorProfileViewSet, basename='creator-profile')
urlpatterns = router.urls
