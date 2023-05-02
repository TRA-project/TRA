from django.db import models
from django.conf import settings

from .appuser import AppUser


class Feedback(models.Model):
    """
    Foreign keys:

    target_users - AppUser
    """
    time = models.DateTimeField(auto_now_add=True)
    type = models.SmallIntegerField(choices=settings.FEEDBACK_TYPE, default=0)
    owner = models.ForeignKey(AppUser, on_delete=models.SET_NULL, null=True, related_name='feedbacks')
    content = models.TextField(null=True, default=None, max_length=settings.MAX_MESSAGE_CONTENT_LENGTH)
