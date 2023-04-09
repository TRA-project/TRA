from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator

from .appuser import AppUser
from .position import Position
from .address import Address
from .schedule import Schedule
from .tag import Tag


class Companion(models.Model):
    """
    Foreign keys:
    """
    owner = models.ForeignKey(AppUser, on_delete=models.DO_NOTHING, related_name='companions')
    time = models.DateTimeField(auto_now_add=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    deadline = models.DateTimeField()
    title = models.TextField(default='', max_length=settings.MAX_TRAVEL_TITLE_LENGTH)
    content = models.TextField(default='', max_length=settings.MAX_TRAVEL_CONTENT_LENGTH)
    private_content = models.TextField(default='')
    schedule = models.ForeignKey(Schedule, on_delete=models.DO_NOTHING, null=True,
                                 related_name='schedule_companion_records')
    tag = models.ManyToManyField(Tag, related_name='tag_companion_records')
    capacity = models.PositiveIntegerField(validators=[MaxValueValidator(settings.COMPANION_MAX_CAPACITY)])
    fellows = models.ManyToManyField(AppUser, related_name='joined_companions')
    cancelled_users = models.ManyToManyField(AppUser, related_name='cancelled_companions')

    # comments = models.ManyToManyField('Comment', related_name='companion_master', blank=True)
    position = models.OneToOneField(Address, related_name='companion', on_delete=models.SET_NULL, null=True, blank=True)

    forbidden = models.IntegerField(default=settings.TRAVEL_FORBIDDEN_FALSE)
    forbidden_reason = models.TextField(default='')
