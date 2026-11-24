from rest_framework.routers import DefaultRouter
from .views import CompetitorViewSet,ObservationViewSet
router=DefaultRouter();router.register(r'profiles',CompetitorViewSet,basename='competitors');router.register(r'observations',ObservationViewSet,basename='observations');urlpatterns=router.urls
