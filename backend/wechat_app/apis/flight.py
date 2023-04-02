import math
import random
from datetime import datetime, timedelta

from django.db import connection
from django.db.models import Q
from joblib.numpy_pickle_utils import xrange
from rest_framework import viewsets
from rest_framework.decorators import action

from utils.api_tools import save_log, get_recommend_cities
from utility.models import Flight, UsersFlight, City, Province
from wechat_app.serializers import FlightSerializer, FlightDetailedSerializer, CitySerializer, ProvinceSerializer
from utils.response import *
from utils import conversion, filters, permission
from django.conf import settings
from rest_framework.exceptions import NotFound


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

        try:
            query_city = request.query_params.get('city', None)
            query_endcity = request.query_params.get('endcity', None)
            queryset = super().filter_queryset(request, queryset.filter(Q(city__name=query_city) &
                                                                        Q(endcity__name=query_endcity)), view)
            query_date = request.query_params.get('date', None)
            query_year, query_month, query_day = query_date.split("-")
            query_date = datetime(eval(query_year), eval(query_month), eval(query_day))
            query_date_next = query_date + timedelta(days=1)
            queryset = queryset.filter(Q(depart_time__gt=query_date) & Q(depart_time__lt=query_date_next))
        except Exception:
            raise NotFound()

        order = conversion.get_int(request.query_params, 'order', base=settings.FLIGHT_LIST_MODE_DEFAULT)
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


class FlightApis(viewsets.GenericViewSet, viewsets.mixins.RetrieveModelMixin,
                 viewsets.mixins.ListModelMixin):
    filter_backends = [FlightFilterBackend]
    permission_classes = [permission.FlightPermission]
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = FlightDetailedSerializer(instance)

        request_user = permission.user_check(request)

        data = serializer.data
        if_follow = settings.USERS_FLIGHT_UNFOLLOW
        if_alarm = settings.USERS_FLIGHT_ALARM_FALSE
        try:
            usersFlight = UsersFlight.objects.all().filter(Q(user_id=request_user) & Q(flight_id=instance.id)).first()
            if usersFlight is not None:
                if_follow = settings.USERS_FLIGHT_FOLLOW
                if_alarm = usersFlight.if_alarm
        except Exception as e:
            print(e)

        # Log
        save_log(user_id=request_user, action=settings.LOG_FLIGHT_VIEW, target_id=instance.id)

        data['if_follow'] = if_follow
        data['if_alarm'] = if_alarm
        return Response(data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        request_user = permission.user_check(request)

        # page = self.paginate_queryset(queryset)
        # if page is not None:
        #     serializer = self.get_serializer(page, many=True, context={'user_id': request_user})
        #     return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True ,context={'user_id': request_user})
        return Response({"count":queryset.count(),"results":serializer.data})

    @action(methods=['GET'], detail=False, url_path='transfer')
    def transfer(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        if request_user == 0:
            raise NotFound()
        query_city = request.query_params.get('city', None)
        query_endcity = request.query_params.get('endcity', None)
        query_date = request.query_params.get('date', None)
        query_year, query_month, query_day = query_date.split("-")
        query_date = datetime(eval(query_year), eval(query_month), eval(query_day))
        query_date = query_date + timedelta(hours=-8)
        query_date_next = query_date + timedelta(days=1)
        order = request.query_params.get('order', None)
        if order is not None:
            order = eval(order)
        if order == None or order not in settings.FLIGHT_TRANS_LIST_MODES:
            order = settings.FLIGHT_TRANS_LIST_MODE_DEFAULT
        query_sentence = "SELECT f1.id, f2.id, (f1.economy_minprice+f2.economy_minprice) as total_price, " \
                         "f1.depart_time as depart_time, f2.arrival_time as arrival_time, " \
                         "(julianday(f2.depart_time) - julianday(f1.arrival_time))*24 as " \
                         "delte_time ,(julianday(f2.arrival_time) - julianday(f1.depart_time))*24 as total_cost_time" \
                         ",f1.endcity_id as transfer_city " \
                         "FROM app_flight as f1, app_flight as f2 WHERE f1.city_id = '" + query_city + "' " \
                                                                                                       "AND f2.endcity_id = '" + query_endcity + "' AND f1.depart_time BETWEEN '" + query_date.__str__() + "' " \
                                                                                                                                                                                                                  "AND '" + query_date_next.__str__() + "' AND f1.endcity_id = f2.city_id AND f2.depart_time BETWEEN " \
                                                                                                                                                                                                                                                               "datetime(f1.arrival_time,'+2 hour') AND datetime(f1.arrival_time,'+1 day') " \
                                                                                                                                                                                                                                                               "ORDER BY " + (
                             "total_price" if order == settings.FLIGHT_TRANS_LIST_MODE_DEPART_COST_UP
                             else "total_cost_time") + " LIMIT 5"
        cursor = connection.cursor()
        cursor.execute(query_sentence)
        row = cursor.fetchall()
        transfer_flight = []
        count = 0
        for obj in row:
            count = count + 1
            dic = {}
            dic['first_flight'] = FlightSerializer(Flight.objects.all().get(id=obj[0]),
                                                   context={'user_id': request_user}).data
            dic['second_flight'] = FlightSerializer(Flight.objects.all().get(id=obj[1]),
                                                    context={'user_id': request_user}).data
            dic['total_price'] = obj[2]
            dic['depart_time'] = obj[3] + timedelta(hours=8)
            dic['arrival_time'] = obj[4] + timedelta(hours=8)
            tmp = math.modf(round(obj[5], 2))
            time_str = "" + str(round(tmp[1])).zfill(2) + ":" + str(round(tmp[0] * 60)).zfill(2) + ":00"
            dic['delta_time'] = time_str
            tmp = math.modf(round(obj[6], 2))
            time_str = "" + str(round(tmp[1])).zfill(2) + ":" + str(round(tmp[0] * 60)).zfill(2) + ":00"
            dic['total_cost_time'] = time_str
            dic['trans_city'] = obj[7]
            transfer_flight.append(dic)
        data = transfer_flight
        return Response({"count": count, "results": data})

    @action(methods=['GET'], detail=False, url_path='cheap_flight')
    def cheap_flight(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        start = datetime.today() + timedelta(days=1)
        end = datetime.today() + timedelta(days=4)

        instance = Flight.objects.all().filter(depart_time__range=(start, end))
        size = int(instance.count() / 10)
        instance = instance.order_by('-economy_discount')[:size]
        sample = random.sample(xrange(size), 3)
        result = [instance[i] for i in sample]
        serializer = self.get_serializer(result, many=True, context={'user_id': request_user})
        return Response({"result": serializer.data})

    @action(methods=['GET'], detail=False, url_path='recommend_flight')
    def recommend_flight(self, request, *args, **kwargs):
        request_user = permission.user_check(request)
        start = datetime.today() + timedelta(days=1)
        end = datetime.today() + timedelta(days=4)
        cities = get_recommend_cities(request_user)
        rec_num = int(len(cities) * 1.5)
        instance = Flight.objects.all().filter(Q(depart_time__range=(start, end)) & Q(economy_discount__gt=0.01))
        rec_flight = instance.filter(Q(endcity__name__in=cities)).order_by('?')[0:rec_num]
        rec_count = rec_flight.count()
        rec_flight_ids = list(rec_flight.values_list('id', flat=True))
        other_flight = instance.exclude(id__in=rec_flight_ids).order_by('?')[0:10 - rec_count]
        instance = rec_flight | other_flight
        serializer = self.get_serializer(instance, many=True, context={'user_id': request_user})
        return Response({"result": serializer.data})

