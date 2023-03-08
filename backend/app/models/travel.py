from django.db import models
from django.db.models import Sum, F
from django.conf import settings

from utilities import uuid

from .appuser import AppUser
from .address import Address
from .images import Image
from .tag import Tag
from .schedule import Schedule
from .travelCollection import TravelCollection
from utilities import date


class Travel(models.Model):
    """
    Foreign keys:

    collectors - AppUser
    read_records - ReadRecord
    """
    owner = models.ForeignKey(AppUser, on_delete=models.DO_NOTHING, null=True, related_name='travel_records')
    time = models.DateTimeField(auto_now_add=True)
    title = models.TextField(default='', max_length=settings.MAX_TRAVEL_TITLE_LENGTH)
    tag = models.ManyToManyField(Tag, related_name='tag_travel_records')
    content = models.TextField(default='', max_length=settings.MAX_TRAVEL_CONTENT_LENGTH, blank=True)
    likes = models.ManyToManyField(AppUser, related_name='liked_records', blank=True)
    cover = models.ForeignKey(Image, related_name='travel_covers', null=True, on_delete=models.CASCADE)
    images = models.ManyToManyField(Image, related_name='travels')
    schedule = models.ForeignKey(Schedule, on_delete=models.DO_NOTHING, null=True,
                                 related_name='schedule_travel_records')
    # comments = models.ManyToManyField('Comment', related_name='master', blank=True)

    position = models.OneToOneField(Address, related_name='travel_record', null=True, on_delete=models.SET_NULL)

    read_total = models.IntegerField(default=0)
    last_read = models.DateTimeField(auto_now_add=True)
    visibility = models.IntegerField(default=settings.TRAVEL_VISIBILITIES_DEFAULT)

    forbidden = models.IntegerField(default=settings.TRAVEL_FORBIDDEN_FALSE)
    forbidden_reason = models.TextField(default='')

    collection = models.ForeignKey(TravelCollection, related_name='collection_travels', null=False,
                                   on_delete=models.CASCADE)


    def read_increase(self):
        self.read_total = F('read_total') + 1
        time_now = date.now()
        date_now = time_now.date()
        date_last = self.last_read.date()
        if date_now > date_last:
            date_std = date_now - date.timedelta(days=settings.TRAVEL_HEAT_READ_RECORD)
            self.read_records.filter(date__lte=date_std).delete()
        today = self.read_records.filter(date=date_now)
        if today:
            today = today.first()
            today.amount = F('amount') + 1
        else:
            today = ReadRecord(date=date_now, owner=self, amount=1)
        today.save()
        self.last_read = time_now
        self.save()

    @property
    def read_recent(self):
        date_now = date.now().date()
        date_last = self.last_read.date()
        if date_now > date_last:
            date_std = date_now - date.timedelta(days=settings.TRAVEL_HEAT_READ_RECORD)
            self.read_records.filter(date__lte=date_std).delete()
        return self.read_records.all().aggregate(r=Sum('amount'))['r']


class ReadRecord(models.Model):
    """
    Foreign keys:

    """
    date = models.DateField(auto_now=True)
    amount = models.IntegerField(default=0)
    owner = models.ForeignKey(Travel, on_delete=models.CASCADE, related_name='read_records')
