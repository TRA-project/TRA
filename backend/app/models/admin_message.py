from django.db import models
from django.conf import settings

from .appuser import AppUser

class AdminMessage(models.Model):
    """
    Foreign keys:

    target_users - AppUser
    """
    time = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(AppUser, on_delete=models.SET_NULL, null=True, related_name='admin_messages')
    content = models.TextField(null=True, default=None, max_length=settings.MAX_MESSAGE_CONTENT_LENGTH)

