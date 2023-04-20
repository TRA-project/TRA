from django.db import models
from .image import Image

class Food(models.Model):
    name = models.CharField(max_length=255) # 美食名称
    description = models.TextField() # 美食描述
    images = models.ManyToManyField(Image) # 美食图片多对多关系
    price = models.DecimalField(max_digits=6, decimal_places=2) # 美食价格