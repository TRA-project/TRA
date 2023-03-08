from datetime import datetime, timedelta

from django.db.models import Q
from rest_framework.decorators import action
from django.http import QueryDict

from app.models import Message, AppUser, Flight, UsersFlight, City, Province
from adminsystem.serializers import FlightSerializer, FlightDetailedSerializer, CitySerializer, ProvinceSerializer
from app.utilities import permission
from app.response import *
from utilities import conversion, filters, permission as _permission
from django.conf import settings
from rest_framework.exceptions import ParseError, NotAcceptable, PermissionDenied, NotFound
from rest_framework import viewsets, permissions

from utilities.conversion import get_list


class ProvinceApis(viewsets.GenericViewSet, viewsets.mixins.ListModelMixin):
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({"results": serializer.data})


class CityFilterBackend(filters.QueryFilterBackend):
    default_ordering_rule = 'name'

    def filter_queryset(self, request, queryset, view):
        try:
            query_province_id = request.query_params.get('province_id', None)
            if query_province_id is not None:
                queryset = super().filter_queryset(request, queryset.filter(province=query_province_id), view)
            else:
                query_province = request.query_params.get('province', None)
                if query_province is not None:
                    queryset = super().filter_queryset(request, queryset.filter(province__name=query_province), view)
        except Exception:
            raise NotFound()
        return queryset


class CityApis(viewsets.GenericViewSet, viewsets.mixins.ListModelMixin):
    filter_backends = [CityFilterBackend]
    queryset = City.objects.all()
    serializer_class = CitySerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({"results": serializer.data})

    @action(methods=['GET'], detail=False, url_path='all')
    def all(self, request, *args, **kwargs):
        provinces = Province.objects.all()
        serializer = ProvinceSerializer(provinces, many=True)
        data = []
        data.append(serializer.data)
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        data.append(serializer.data)
        return Response({"results": data})


class FlightFilterBackend(filters.QueryFilterBackend):
    default_ordering_rule = 'depart_time'

    def filter_queryset(self, request, queryset, view):
        if view:
            action = view.action
            if action != 'list':
                return queryset
        query_city = request.query_params.get('city', None)
        query_endcity = request.query_params.get('endcity', None)
        queryset = super().filter_queryset(request, queryset, view)
        if query_city is not None:
            queryset = queryset.filter(city__name=query_city)
        if query_endcity is not None:
            queryset = queryset.filter(endcity__name=query_endcity)
        query_date = request.query_params.get('date', None)
        if query_date is not None:
            query_year, query_month, query_day = query_date.split("-")
            query_date = datetime(eval(query_year), eval(query_month), eval(query_day))
            query_date_next = query_date + timedelta(days=1)
            queryset = queryset.filter(Q(depart_time__gt=query_date) & Q(depart_time__lt=query_date_next))


        order = conversion.get_int(request.query_params, 'order')
        if not order in settings.FLIGHT_LIST_MODES:
            order = settings.FLIGHT_LIST_MODE_DEFAULT

        if order == settings.FLIGHT_LIST_MODE_DEPART_TIME_UP:
            queryset = queryset.order_by('depart_time')
        elif order == settings.FLIGHT_LIST_MODE_DEPART_TIME_DOWN:
            queryset = queryset.order_by('-depart_time')
        elif order == settings.FLIGHT_LIST_MODE_ECONOMY_MINPRICE_UP:
            queryset = queryset.order_by('economy_minprice')
        elif order == settings.FLIGHT_LIST_MODE_ECONOMY_MINPRICE_DOWN:
            queryset = queryset.order_by('-economy_minprice')
        elif order == settings.FLIGHT_LIST_MODE_BUSINESS_MINPRICE_UP:
            queryset = queryset.order_by('bussiness_minprice')
        elif order == settings.FLIGHT_LIST_MODE_BUSINESS_MINPRICE_DOWN:
            queryset = queryset.order_by('-bussiness_minprice')
        elif order == settings.FLIGHT_LIST_MODE_ECONOMY_DISCOUNT_UP:
            queryset = queryset.order_by('economy_discount')
        elif order == settings.FLIGHT_LIST_MODE_ECONOMY_DISCOUNT_DOWN:
            queryset = queryset.order_by('-economy_discount')
        elif order == settings.FLIGHT_LIST_MODE_BUSINESS_DISCOUNT_UP:
            queryset = queryset.order_by('bussiness_discount')
        elif order == settings.FLIGHT_LIST_MODE_BUSINESS_DISCOUNT_DOWN:
            queryset = queryset.order_by('-bussiness_discount')
        elif order == settings.FLIGHT_LIST_MODE_COST_TIME_UP:
            queryset = queryset.order_by('cost_time')
        elif order == settings.FLIGHT_LIST_MODE_COST_TIME_DOWN:
            queryset = queryset.order_by('-cost_time')
        return queryset


class FlightApis(viewsets.ModelViewSet):
    filter_backends = [FlightFilterBackend]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Flight.objects.all()
    serializer_class = FlightDetailedSerializer

    def bulk_destroy(self, request, *args, **kwargs):
        ids = get_list(request.data, 'id')
        objs = self.get_queryset().filter(id__in=ids)
        objs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)


