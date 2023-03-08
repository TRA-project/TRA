from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator

from .images import Image

class Advertisement(models.Model):
    """
    Foreign keys:
    """
    time = models.DateTimeField(auto_now_add=True)
    title = models.TextField(default='', max_length=settings.MAX_TRAVEL_TITLE_LENGTH)
    content = models.TextField(default='')
    cover = models.ForeignKey(Image, related_name='ad_covers', null=True, on_delete=models.CASCADE)
    url = models.URLField(default='')
    action = models.TextField(null=True, default=None)
    visible = models.BooleanField(default=False)
    read = models.PositiveIntegerField(default=0)
