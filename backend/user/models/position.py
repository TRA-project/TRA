from django.db import models

from .image import Image


class Position(models.Model):
    id = models.CharField(max_length=6, primary_key=True) # adcode
    name = models.CharField(max_length=32, default='')
    longitude = models.FloatField(default=0.0)
    latitude = models.FloatField(default=0.0)
    description = models.TextField(default='')
    cover = models.ForeignKey(Image, related_name='positions', null=True, on_delete=models.CASCADE)
    images = models.ManyToManyField(Image, related_name='position_owner')
    visibility = models.BooleanField(default=False)
