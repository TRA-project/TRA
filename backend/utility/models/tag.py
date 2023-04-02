from django.db import models
from django.conf import settings


class Tag(models.Model):
    name = models.CharField(max_length=settings.MAX_TAG_NAME_LEN, null=False, primary_key=True)
