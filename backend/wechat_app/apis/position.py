from rest_framework import viewsets, permissions
from rest_framework.decorators import action

from django.conf import settings
from utility.models import Position, AppUser, TravelNotes
from wechat_app.serializers import PositionSerializer
from utils.response import *
from utils.location import nearest
from utils import conversion, permission as _permission, filters


class PositionFilterBackend(filters.QueryFilterBackend):
    filter_fields = [
        ('name', 'name', 'contains'),
        ('id', 'id', 'contains'),
    ]
    default_ordering_rule = 'id'

    def filter_queryset(self, request, queryset, view):
        return super().filter_queryset(request, queryset.exclude(visibility=False), view)


class PositionApis(viewsets.GenericViewSet, viewsets.mixins.ListModelMixin,
                   viewsets.mixins.RetrieveModelMixin):
    filter_backends = [PositionFilterBackend]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Position.objects.all()
    serializer_class = PositionSerializer

    @action(methods=['GET'], detail=False, url_path='subarea')
    def subarea(self, request, *args, **kwargs):

        adcode = request.GET.get('adcode', None)
        if adcode is None:
            return error_response(400)
        subs = settings.ADCODE.get(adcode, None)
        if subs is None:
            return error_response(400)
        children = []
        for c in subs['children']:
            c = settings.ADCODE.get(c, None)
            if c is None: continue
            c = {'name': c['name'], 'longitude': c['longitude'], 'latitude': c['latitude']}
            children.append(c)
        return response(children)

    @action(methods=['GET'], detail=False, url_path='location')
    def location(self, request, *args, **kwargs):
        lon = conversion.get_float(request.GET, 'longitude')
        lat = conversion.get_float(request.GET, 'latitude')
        if lon is None or lat is None:
            return error_response(400)
        adcode, name, lon, lat = nearest(lon, lat)
        return response({'adcode': adcode, 'name': name, 'longitude': lon, 'latitude': lat})

    @action(methods=['GET'], detail=False, url_path='recommend')
    def recommend(self, request, *args, **kwargs):
        count = conversion.get_int(request.query_params, 'count')
        if count is None:
            count = settings.POSITION_RECOMMEND_AMOUNT
        else:
            count = min(count, settings.POSITION_RECOMMEND_MAX_AMOUNT)
        pos = self.recommend_positions(request, amount=count, unique=True)
        queryset = self.get_queryset().filter(id__in=pos)
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        return Response(data={'count': len(data), 'data': data})

    @classmethod
    def recommend_positions(cls, request, amount=10, unique=False):
        owner_id = _permission.user_check(request)
        if owner_id <= 0:
            return filters.random_filter(Position.objects.all(), amount).values_list('id', flat=True)
        user = AppUser.objects.filter(id=owner_id)
        if not user:
            return filters.random_filter(Position.objects.all(), amount).values_list('id', flat=True)
        user = user.first()

        filter_args = {}

        first_likes = user.first_likes()
        if first_likes:
            filter_args['time__gte'] = first_likes[first_likes.count() - 1].time

        likes = TravelNotes.objects.filter(likes__cluster=user.cluster, position__position__isnull=False, **filter_args)
        if unique:
            positions = filters.random_filter(likes, amount * settings.POSITION_RECOMMEND_TRUNCATE).values_list(
                'position__position__id', flat=True).distinct()[:amount]
        else:
            positions = filters.random_filter(likes, amount).values_list('position__position__id', flat=True)
        positions = list(positions)
        if len(positions) < amount:
            positions += list(
                filters.random_filter(Position.objects.exclude(id__in=positions), amount - len(positions)).values_list(
                    'id', flat=True))
        return positions
