from django.db.models import Q

from backend import settings
from wechat_app.models import Schedule, Message, UsersFlight, ScheduleItem
import datetime


# 定时任务
def schedule_notify():
    try:
        loca_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        now_date, now_time = loca_time.split(" ")
        now_hour = eval(now_time.split(":")[0])
        if now_hour == 23:
            loca_time = (datetime.datetime.now() + datetime.timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')
            now_date, now_time = loca_time.split(" ")
            next_time = "00:00:00"
            nnext_time = "01:00:00"
        else:
            next_time = str(now_hour + 1).zfill(2) + ":00:00"
            if now_hour == 22:
                nnext_time = "23:59:59"
            else:
                nnext_time = str(now_hour + 2).zfill(2) + ":00:00"

        schedule = list(Schedule.objects.all().exclude(owner_id=None).filter(Q(date=now_date)).values_list('id'))
        schedule_items = ScheduleItem.objects.all().filter(
            Q(schedule_id__in=schedule) & Q(if_alarm=settings.SCHEDULE_ALARM_TRUE) & Q(
                start_time__gte=next_time) & Q(
                start_time__lt=nnext_time))
        for item in schedule_items:
            Message.create_message(source_user=None, target_user=item.schedule.owner,
                                   type=settings.MESSAGE_TYPE_SCHEDULE_NOTIFY,
                                   schedule_item=item)
        print(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S') + " " + str(schedule_items.count()) + " 项日程已通知")
    except Exception as e:
        print(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S') + " " + '发生错误，错误信息为：', e)


def flight_notify():
    try:
        next_date = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime('%Y-%m-%d') + " 00:00:00"
        nnext_date = (datetime.datetime.now() + datetime.timedelta(days=2)).strftime('%Y-%m-%d') + " 00:00:00"
        usersflights = UsersFlight.objects.all().filter(
            Q(if_alarm=settings.USERS_FLIGHT_ALARM_TRUE) & Q(flight__depart_time__gte=next_date)
            & Q(flight__depart_time__lt=nnext_date))
        for item in usersflights:
            Message.create_message(source_user=None, target_user=item.user, type=settings.MESSAGE_TYPE_FLIGHT_NOTIFY,
                                   flight=item.flight)
        print(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S') + " " + str(usersflights.count()) + " 项航班已通知")
    except Exception as e:
        print(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S') + " " + '发生错误，错误信息为：', e)
