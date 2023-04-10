from django.db import models
from .address import Address
class Hotel(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    address = models.ForeignKey(Address, related_name='address', null=True, default=None, on_delete=models.CASCADE)
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    rating = models.FloatField(default=0.0) # 添加评分字段
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True) # 添加价格字段
