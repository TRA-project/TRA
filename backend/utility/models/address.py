from django.db import models

from utils.location import encode_addr
from .position import Position


class Address(models.Model):
    name = models.CharField(max_length=32, default='', blank=True)
    longitude = models.FloatField(default=0.0, null=True)
    latitude = models.FloatField(default=0.0, null=True)
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
        name, lon, lat = position['name'], position['longitude'], position['latitude']
        n, p, c, d, s, sn, adcode_province, adcode_city, adcode_district = encode_addr(position['address'], lon, lat)

        address = Address.objects.create(name=name, longitude=lon, latitude=lat, position_id=adcode_district,
                                         city_position_id=adcode_city, province_position_id=adcode_province,
                                         nation=n, province=p, city=c, district=d, street=s, street_number=sn)
        return address

    @classmethod
    def update_address(cls, instance, position):
        name, lon, lat = position['name'], position['longitude'], position['latitude']
        n, p, c, d, s, sn, adcode_province, adcode_city, adcode_district = encode_addr(position['address'], lon, lat)

        address = instance
        if not address or not isinstance(address, Address):
            address = Address.objects.create(name=name, longitude=lon, latitude=lat, position_id=adcode_district,
                                             city_position_id=adcode_city, province_position_id=adcode_province,
                                             nation=n, province=p, city=c, district=d, street=s, street_number=sn)
        else:
            address.name = name
            address.longitude = lon
            address.latitude = lat
            address.position_id = adcode_district
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

    def __str__(self):
        return self.name
