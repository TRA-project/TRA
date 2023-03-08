from django.db import models
from django.conf import settings

from .address import Address
from .port import Port
from .position import Position


class Province(models.Model):
    name = models.CharField(max_length=settings.MAX_PROVINCE_NAME_LEN)


class City(models.Model):
    name = models.CharField(max_length=settings.MAX_CITY_NAME_LEN, primary_key=True)
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='city_province')


class Flight(models.Model):
    flight_no = models.CharField(max_length=settings.MAX_FLIGHT_NO_LEN, default='', blank=True)
    airline = models.CharField(max_length=settings.MAX_FLIGHT_AIRLINE_LEN, default='', blank=True)
    departport = models.ForeignKey(Port, related_name='depart_flight_records', null=True, on_delete=models.SET_NULL)
    arrivalport = models.ForeignKey(Port, related_name='arrival_flight_records', null=True, on_delete=models.SET_NULL)
    economy_minprice = models.FloatField(null=True)
    economy_discount = models.FloatField(null=True)
    bussiness_minprice = models.FloatField(null=True)
    bussiness_discount = models.FloatField(null=True)
    food = models.BooleanField(null=True)
    depart_time = models.DateTimeField()
    cost_time = models.TimeField()
    arrival_time = models.DateTimeField()
    status = models.IntegerField(default=settings.FLIGHT_STATUS_DEFAULT)
    city = models.ForeignKey(City, related_name='depart_flight_records', null=True, on_delete=models.SET_NULL)
    endcity = models.ForeignKey(City, related_name='arrival_flight_records', null=True, on_delete=models.SET_NULL)
