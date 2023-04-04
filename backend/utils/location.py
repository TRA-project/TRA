import math
from django.conf import settings
from rest_framework import serializers

from utility.models.position import Position

EARTH_RADIUS = 6371.393


def axis(lon, lat):
    lon, lat = math.pi * lon / 180, math.pi * lat / 180
    r = EARTH_RADIUS * math.cos(lat)
    x = r * lon
    xrev = x - 2 * math.pi * r
    y = EARTH_RADIUS * lat
    return x, y, xrev


def nearest(lon, lat):
    x, y, xrev = axis(lon, lat)
    data = settings.ADCODE_DF
    data = data[(data['adcode'] % 100) != 0].copy(deep=True)
    data['x2'] = (data['x'] - x) ** 2
    data['y2'] = (data['y'] - y) ** 2
    data['xrev21'] = (data['x'] - xrev) ** 2
    data['xrev22'] = (data['xrev'] - x) ** 2
    data['x2'] = data[['x2', 'xrev21', 'xrev22']].min(axis=1)
    data['dis2'] = data['x2'] + data['y2']

    item = data.nsmallest(1, ['dis2']).iloc[0]
    return str(item['adcode']), item['name'], float(item['longitude']), float(item['latitude'])


def encode_addr(addr, lon, lat):
    """
    根据地址为其所在行政区编码
    :param addr: 地址
    :param lon: 经度信息
    :param lat: 纬度信息，当数据库中没有地址中的行政区信息时会根据定位信息查找，默认为北京
    :return:
    """
    lonlat = lon is not None and lat is not None
    n, p, c, d, s, sn = addr['nation'], addr['province'], addr['city'], addr['district'], addr['street'], \
        addr['street_number']
    ps = Position.objects.filter(name=d)
    if ps:
        adcode_district = ps.first().id
        adcode_city = adcode_district[:4] + '00'
        adcode_province = adcode_city[:2] + '0000'
    elif lonlat:
        adcode_district, *_ = nearest(lon, lat)
        Position.objects.create(id=adcode_district, name=d, latitude=lat, longitude=lon)
        ps = Position.objects.filter(name=c)
        if ps:
            adcode_city = ps.first().id
            adcode_province = adcode_city[:2] + '0000'
        else:
            adcode_city = adcode_district[:4] + '00'
            Position.objects.create(id=adcode_city, name=c, latitude=lat, longitude=lon)
            ps = Position.objects.filter(name=p)
            if ps:
                adcode_province = ps.first().id
            else:
                adcode_province = adcode_city[:2] + '0000'
                Position.objects.create(id=adcode_province, name=p, latitude=lat, longitude=lon)
    else:
        raise serializers.ValidationError('Requires longitude and latitude')
    return n, p, c, d, s, sn, adcode_province, adcode_city, adcode_district
