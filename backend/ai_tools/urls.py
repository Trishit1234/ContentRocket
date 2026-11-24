from rest_framework.routers import DefaultRouter
from .views import IdeaViewSet, ScriptViewSet, CaptionViewSet
router=DefaultRouter()
router.register(r'ideas',IdeaViewSet,basename='ideas')
router.register(r'scripts',ScriptViewSet,basename='scripts')
router.register(r'captions',CaptionViewSet,basename='captions')
urlpatterns=router.urls
