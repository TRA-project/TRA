from django.urls import path, include

from wechat_app.apis import *
from utils import routers

ROUTER = routers.TravelRouter()
ROUTER.register(r'users', UserApis)
ROUTER.register(r'travels', TravelApis)
ROUTER.register(r'comments', CommentApis)
ROUTER.register(r'position', PositionApis)
ROUTER.register(r'messages', MessageApis)
ROUTER.register(r'companions', CompanionApis)
ROUTER.register(r'images', ImageApis)
ROUTER.register(r'adminmessages', AdminMessageApis)
ROUTER.register(r'ads', AdvertisementApis)
ROUTER.register(r'flight', FlightApis)
ROUTER.register(r'schedule', ScheduleApis)
ROUTER.register(r'schedule_item', ScheduleItemApis)
ROUTER.register(r'usersflight', UsersFlightApis)
ROUTER.register(r'city', CityApis)
ROUTER.register(r'province', ProvinceApis)
ROUTER.register(r'travelcollection', TravelCollectionApis)
ROUTER.register(r'tag', TagApis)


urlpatterns = [
    path('', include(ROUTER.urls)),
]
