from django.db import models

from utils import location
from .position import Position


class Address(models.Model):
    name = models.CharField(max_length=32, default='', blank=True)
    # address = models.TextField()
    longitude = models.FloatField(default=0.0)
    latitude = models.FloatField(default=0.0)
    position = models.ForeignKey(Position, related_name='addresses', null=True, on_delete=models.SET_NULL)
    city_position = models.ForeignKey(Position, related_name='addresses_city', null=True, on_delete=models.SET_NULL)
    province_position = models.ForeignKey(Position, related_name='addresses_province', null=True,
                                          on_delete=models.SET_NULL)

    nation = models.CharField(max_length=32, default='', blank=True)
    province = models.CharField(max_length=32, default='', blank=True)
    city = models.CharField(max_length=32, default='', blank=True)
    district = models.CharField(max_length=32, default='', blank=True)
    street = models.CharField(max_length=32, default='', blank=True)
    street_number = models.CharField(max_length=64, default='', blank=True)

    @classmethod
    def create_address(cls, position):
        lon, lat = position['longitude'], position['latitude']
        addr, pname = position['address'], position['name']
        n, p, c, d, s, sn = addr['nation'], addr['province'], addr['city'], addr['district'], addr['street'], addr[
            'street_number']
        ps = Position.objects.filter(name=d)
        if ps:
            adcode = ps.first().id
        else:
            adcode, *_ = location.nearest(lon, lat)
        ps = Position.objects.filter(name=c)
        if ps:
            adcode_city = ps.first().id
        else:
            adcode_city = adcode[:4] + '00'
        ps = Position.objects.filter(name=p)
        if ps:
            adcode_province = ps.first().id
        else:
            adcode_province = adcode_city[:2] + '0000'
        address = Address.objects.create(name=pname, longitude=lon, latitude=lat, position_id=adcode,
                                         city_position_id=adcode_city, province_position_id=adcode_province,
                                         nation=n, province=p, city=c, district=d, street=s, street_number=sn)
        return address

    @classmethod
    def update_address(cls, instance, position):
        lon, lat = position['longitude'], position['latitude']
        addr, pname = position['address'], position['name']
        n, p, c, d, s, sn = addr['nation'], addr['province'], addr['city'], addr['district'], addr['street'], addr[
            'street_number']
        ps = Position.objects.filter(name=d)
        if ps:
            adcode = ps.first().id
        else:
            adcode, *_ = location.nearest(lon, lat)
        address = instance
        ps = Position.objects.filter(name=c)
        if ps:
            adcode_city = ps.first().id
        else:
            adcode_city = adcode[:4] + '00'
        ps = Position.objects.filter(name=p)
        if ps:
            adcode_province = ps.first().id
        else:
            adcode_province = adcode_city[:2] + '0000'
        if not address:
            address = Address.objects.create(name=pname, longitude=lon, latitude=lat, position_id=adcode,
                                             city_position_id=adcode_city, province_position_id=adcode_province,
                                             nation=n, province=p, city=c, district=d, street=s, street_number=sn)
        else:
            address.name = pname
            address.longitude = lon
            address.latitude = lat
            address.position_id = adcode
            address.city_position_id = adcode_city
            address.province_position_id = adcode_province
            address.nation = n
            address.province = p
            address.city = c
            address.district = d
            address.street = s
            address.street_number = sn
            address.save()
        return address
