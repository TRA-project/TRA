from django.urls import path, include

from .apis import *
from utils import routers

ROUTER = routers.TravelRouter()
ROUTER.register(r'users', UserApis)
ROUTER.register(r'travels', TravelNotesApis)
ROUTER.register(r'comments', CommentApis)
ROUTER.register(r'position', PositionApis)
ROUTER.register(r'messages', MessageApis)
ROUTER.register(r'companions', CompanionApis)
ROUTER.register(r'images', ImageApis)
ROUTER.register(r'adminmessages', FeedbackApis)
ROUTER.register(r'ads', AdvertisementApis)
ROUTER.register(r'schedule', ScheduleApis)
ROUTER.register(r'flight', FlightApis)
ROUTER.register(r'port', PortApis)
ROUTER.register(r'city', CityApis)
ROUTER.register(r'province', ProvinceApis)
ROUTER.register(r'log', LogApis)
ROUTER.register(r'sights', SightApis)

urlpatterns = [
    path('', include(ROUTER.urls)),
]
