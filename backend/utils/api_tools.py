import json
from collections import Counter

from django.db import connection
from django.db.models import Q, F, Count

from wechat_app.serializers import LogSerializer
from wechat_app.models import AppUser, TravelNotes, Log
from django.conf import settings
from wechat_app.serializers import ScheduleSerializer, ScheduleItemSerializer


def save_log(user_id, action, target_id):
    if user_id <= 0:
        return
    log = dict()
    log['wechat_app'] = user_id
    log['action'] = action
    if target_id is not None:
        log['target_id'] = target_id
    log_serializers = LogSerializer(data=log)
    log_serializers.is_valid(raise_exception=True)
    log_serializers.save()


def get_recommend_cities(user_id):
    user_id = 18
    amount = 5
    user = AppUser.objects.filter(id=user_id).first()
    heat_cities = TravelNotes.objects.all().filter(Q(forbidden=settings.TRAVEL_FORBIDDEN_FALSE,
                                                     visibility=settings.TRAVEL_VISIBILITIES_ALL))
    heat_count = heat_cities.count()
    heat_cities = heat_cities.values(city=F('position__city')).annotate(score=1.0 * Count('city') / heat_count).values(
        'city', 'score')
    heat_cities = list(heat_cities)
    read_travels = Log.objects.all().filter(Q(user_id=user_id) & Q(action=settings.LOG_TRAVEL_VIEW)).values_list(
        'target_id', flat=True)
    read_travels = list(read_travels)
    view_cities = TravelNotes.objects.all().filter(Q(forbidden=settings.TRAVEL_FORBIDDEN_FALSE,
                                                     visibility=settings.TRAVEL_VISIBILITIES_ALL) &
                                                   Q(id__in=read_travels))
    view_count = view_cities.count()
    view_cities = view_cities.values(city=F('position__city')). \
        annotate(score=1.0 * Count('city') / view_count).values('city', 'score')
    view_cities = list(view_cities)
    final = dict()
    for i in heat_cities:
        final[i['city']] = final.get(i['city'], 0) + i['score'] * 0.3
    for i in view_cities:
        final[i['city']] = final.get(i['city'], 0) + i['score'] * 0.7
    final.pop(None, None)
    final = dict(Counter(final).most_common(amount))
    final = list(final.keys())
    tmp = []
    for i in final:
        i = i[:-1]
        tmp.append(i)
    final = tmp
    return final


def copy_schedule(src_sch):
    serializer = ScheduleSerializer(src_sch)
    data = serializer.data
    data.pop('id', None)
    data.pop('owner', None)
    data.pop('create_time', None)
    schedule_items = data.pop('schedule_items', None)
    data['visibility'] = settings.SCHEDULE_VISIBILITIES_ALL
    serializer = ScheduleSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    dst_sch = serializer.save()
    for item in schedule_items:
        data = item
        data.pop('date', None)
        data.pop('id', None)
        data.pop('if_alarm', None)
        data = json.loads(json.dumps(data))
        data['schedule'] = dst_sch.id
        serializer_item = ScheduleItemSerializer(data=data)
        serializer_item.is_valid(raise_exception=True)
        serializer_item.save()
    return dst_sch


def merge_schedule_items(src_sch, dst_sch):
    serializer = ScheduleSerializer(src_sch)
    data = serializer.data
    schedule_items = data.pop('schedule_items', None)
    for item in schedule_items:
        data = item
        data.pop('date', None)
        data.pop('id', None)
        data.pop('if_alarm', None)
        data = json.loads(json.dumps(data))
        data['schedule'] = dst_sch.id
        serializer_item = ScheduleItemSerializer(data=data)
        serializer_item.is_valid(raise_exception=True)
        serializer_item.save()
    return None


def judge_shielding_words(word):
    query_sentence = "select name from app_shieldingwords where '" + word + "' LIKE '%'||name||'%'"
    cursor = connection.cursor()
    cursor.execute(query_sentence)
    row = cursor.fetchall()
    if len(row) > 0:
        return True
    return False
