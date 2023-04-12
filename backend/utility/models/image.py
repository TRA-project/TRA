from django.db import models
from django.conf import settings

from utils import uuid, encrypt
from functools import partial


class Image(models.Model):
    """
    Foreign keys:

    target_users - AppUser
    """
    id = models.CharField(max_length=32, default=partial(encrypt.random_id, len=32), primary_key=True)
    time = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=settings.MAX_IMAGE_DESCRIPTION_LEN, default='')
    image = models.ImageField(
        upload_to=uuid.on_upload_rename('images'),
        editable=True,
    )
