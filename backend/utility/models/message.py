from django.conf import settings
from django.db import models

from .appuser import AppUser
from .comment import Comment
from .companion import Companion
from .flight import Flight
from .schedule_item import ScheduleItem
from .travel_notes import TravelNotes


class Message(models.Model):
    """
    Foreign keys:

    target_users - AppUser
    """
    time = models.DateTimeField(auto_now_add=True)
    type = models.IntegerField(default=settings.MESSAGE_TYPES_DEFAULT)
    #read = models.ManyToManyField(AppUser, related_name='read_messages')

    related_travel = models.ForeignKey(TravelNotes, null=True, default=None, on_delete=models.CASCADE)
    related_comment = models.ForeignKey(Comment, null=True, default=None, on_delete=models.CASCADE)
    related_companion = models.ForeignKey(Companion, null=True, default=None, on_delete=models.CASCADE)
    related_schedule_item = models.ForeignKey(ScheduleItem, null=True, default=None, on_delete=models.CASCADE)
    related_flight = models.ForeignKey(Flight, null=True, default=None, on_delete=models.CASCADE)
    owner = models.ForeignKey(AppUser, on_delete=models.SET_NULL, null=True, related_name='sent_messages')

    content = models.TextField(null=True, default=None, max_length=settings.MAX_MESSAGE_CONTENT_LENGTH)

    @classmethod
    def create_message(cls, source_user, target_user, type, content='', *, travel=None, comment=None, companion=None, schedule_item=None,flight=None, insert=True):
        if not isinstance(source_user, AppUser) and source_user is not None:
            source_user = AppUser.objects.filter(id=source_user)
            if not source_user:
                return None
            source_user = source_user.first()
        if not target_user:
            return None
        if not isinstance(target_user, AppUser):
            target_user = AppUser.objects.filter(id=target_user)
            if not target_user:
                return None
            target_user = target_user.first()
        args = {
            'type': type,
            'content': content,
        }
        if source_user:
            args['owner'] = source_user
        if travel:
            args['related_travel'] = travel
        if companion:
            args['related_companion'] = companion
        if comment:
            args['related_comment'] = comment
        if schedule_item:
            args['related_schedule_item'] = schedule_item
        if flight:
            args['related_flight'] = flight
        if insert:
            res = cls.objects.create(**args)
            target_user.received_messages.add(res)
            target_user.unread_messages.add(res)
        else:
            res = cls(**args)
        return res
