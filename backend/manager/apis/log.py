from collections import Counter
from datetime import datetime, timedelta, timezone

from django.db.models import Q, F, Count
from rest_framework.decorators import action

from user.models import AppUser, Log, TravelNotes, Companion
from manager.serializers import LogSerializer
from utils.response import *
from utils import filters
from django.conf import settings
from rest_framework.exceptions import NotFound
from rest_framework import viewsets, permissions


class LogFilterBackend(filters.QueryFilterBackend):
    filter_fields = [
        ('user', 'user_id', 'exact'),
        ('action', 'action', 'exact'),
    ]
    default_ordering_rule = '-time'

    def filter_queryset(self, request, queryset, view):
        queryset = super().filter_queryset(request, queryset, view)
        query_date = request.query_params.get('date', None)
        if query_date is not None:
            query_year, query_month, query_day = query_date.split("-")
            query_date = datetime(eval(query_year), eval(query_month), eval(query_day))
            query_date_next = query_date + timedelta(days=1)
            queryset = queryset.filter(Q(time__gt=query_date) & Q(time__lt=query_date_next))

        return queryset


class LogApis(viewsets.GenericViewSet, viewsets.mixins.RetrieveModelMixin,
              viewsets.mixins.ListModelMixin):
    filter_backends = [LogFilterBackend]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Log.objects.all()
    serializer_class = LogSerializer

    @action(methods=["GET"], detail=False, url_path='statistics')
    def statistics(self, request, *args, **kwargs):
        activedata = []
        traveldata = []
        companiondata = []
        timedata = []
        for i in range(6, -1, -1):
            dtime_af = (datetime.now() + timedelta(days=-i + 1)).date()
            dtime_bf = (datetime.now() + timedelta(days=-i)).date()
            active_count = Log.objects.all().filter(Q(action=settings.LOG_USER_LOGIN) & Q(time__gte=dtime_bf)
                                                    & Q(time__lt=dtime_af)).values("user").distinct().count()
            activedata.append(active_count)
            travel_count = TravelNotes.objects.all().filter(Q(time__gte=dtime_bf)
                                                            & Q(time__lt=dtime_af)).count()
            traveldata.append(travel_count)

            companion_count = Companion.objects.all().filter(Q(time__gte=dtime_bf)
                                                          & Q(time__lt=dtime_af)).count()
            companiondata.append(companion_count)

            timedata.append(str(dtime_bf.year) + '-' + str(dtime_bf.month) + '-' + str(dtime_bf.day))

        travel_area = TravelNotes.objects.all().exclude(position=None).values(province=F('position__province')). \
            annotate(count=Count('province')).values('province', 'count')
        data = {'activedata': activedata, 'traveldata': traveldata, 'companiondata': companiondata,
                'timedata': timedata}
        return Response({"countdata": data, "areadata": travel_area})

    @action(methods=["GET"], detail=False, url_path='userface')
    def userface(self, request, *args, **kwargs):
        owner_id = request.query_params.get('user', None)
        owner = AppUser.objects.all().filter(id=owner_id).first()
        if owner is None:
            raise NotFound()
        logs = Log.objects.all().filter(user_id=owner_id)
        # count positive score
        positive_last_login = logs.filter(action=settings.LOG_USER_LOGIN).order_by('-time').first().time
        positive_lldd = (datetime.now(timezone.utc) - positive_last_login).days

        delta_day = (datetime.now(timezone.utc) - owner.time).days
        positive_frequency = logs.filter(action=settings.LOG_USER_LOGIN).annotate(tmp=F('time__day')).count()
        positive_frequency_score = positive_frequency / delta_day
        # 可以改进
        positive_engagements = logs.filter(action=settings.LOG_USER_LOGIN).count() * 3 + \
                               logs.filter(action=settings.LOG_TRAVEL_CREATE).count() * 5 + \
                               logs.filter(action=settings.LOG_TRAVEL_VIEW).count() + \
                               logs.filter(action=settings.LOG_TRAVEL_LIKE).count() + \
                               logs.filter(action=settings.LOG_COMPANION_CREATE).count() * 5 + \
                               logs.filter(action=settings.LOG_COMPANION_ADD).count() * 4 + \
                               logs.filter(action=settings.LOG_COMPANION_VIEW).count() + \
                               logs.filter(action=settings.LOG_TRAVELCOLLECTION_CREATE).count() * 2 + \
                               logs.filter(action=settings.LOG_FLIGHT_VIEW).count() + \
                               logs.filter(action=settings.LOG_FLIGHT_FOLLOW).count() + \
                               logs.filter(action=settings.LOG_SCHEDULE_CREATE).count() * 3 + \
                               logs.filter(action=settings.LOG_SCHEDULE_VIEW).count() + \
                               logs.filter(action=settings.LOG_SCHEDULE_COPY).count() * 2 + \
                               logs.filter(action=settings.LOG_COMMENT_CREATE).count()
        positive_score = positive_engagements * positive_frequency_score
        if positive_lldd < 3:
            positive_score *= 1.0
        elif positive_lldd < 7:
            positive_score *= 0.8 + (7 - positive_lldd) * 0.05
        elif positive_lldd < 21:
            positive_score *= 0.2 + (21 - positive_lldd) * 0.042
        else:
            positive_score *= 0.2
        positive_data = {"last_login": positive_last_login, "login_days": positive_frequency,
                         "engage_score": positive_engagements, "positive_score": positive_score}

        # count tags
        create_travels = TravelNotes.objects.all().filter(owner_id=owner_id).values('tag').annotate(
            tag_count=3 * Count('tag')).order_by('-tag_count')[:200].values('tag', 'tag_count')
        view_list = list(logs.filter(action=settings.LOG_TRAVEL_CREATE).values_list('target_id', flat=True))
        view_travels = TravelNotes.objects.all().filter(id__in=view_list).values('tag').annotate(
            tag_count=Count('tag')).order_by('-tag_count')[:200].values('tag', 'tag_count')
        tags = dict()
        for i in create_travels:
            tags[i['tag']] = tags.get(i['tag'], 0) + i['tag_count']
        for i in view_travels:
            tags[i['tag']] = tags.get(i['tag'], 0) + i['tag_count']
        tags.pop(None, None)
        tags = dict(Counter(tags).most_common(25))

        return Response({"tags": tags, "positive_data": positive_data})
