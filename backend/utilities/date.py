import time
import datetime
from datetime import timedelta
from django.utils import timezone

def delta(t):
    return timedelta(seconds=t)

def now():
    t = time.localtime()
    tzinfo = timezone.get_fixed_timezone(delta(t.tm_gmtoff))
    d = datetime.datetime(*t[:6], tzinfo=tzinfo)
    return d

def format(t: datetime.datetime, format='%Y/%m/%d %H:%M:%S'):
    return t.strftime(format)
