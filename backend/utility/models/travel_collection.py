from django.db import models
from django.conf import settings

from . import AppUser


class TravelCollection(models.Model):
    owner = models.ForeignKey(AppUser, on_delete=models.CASCADE, null=True, related_name='user_travelcollections')
    create_time = models.DateTimeField(auto_now_add=True)
    title = models.TextField(null=False, unique=False, max_length=settings.MAX_TC_TITLE_LENGTH)
