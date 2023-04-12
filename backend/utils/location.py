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


def get_adcode(province, city, district):
    """
    根据省份、城市、区县获取行政区编码
    :param province: 省份
    :param city: 城市
    :param district: 区县
    :return: 行政区编码
    """
    province_adcode_list = settings.ADCODE['100000']['children']
    for province_adcode in province_adcode_list:
        if settings.ADCODE[province_adcode]['name'] == province:
            province_dict = settings.ADCODE[province_adcode]
            city_adcode_list = province_dict['children']
            for city_adcode in city_adcode_list:
                if settings.ADCODE[city_adcode]['name'] == city:
                    city_dict = settings.ADCODE[city_adcode]
                    district_adcode_list = city_dict['children']
                    for district_adcode in district_adcode_list:
                        if settings.ADCODE[district_adcode]['name'] == district:
                            return province_adcode, city_adcode, district_adcode
                    break
            break
    return None, None, None


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

    adcode_district, adcode_city, adcode_province = get_adcode(p, c, d)
    pcd = adcode_district is not None and adcode_city is not None and adcode_province is not None
    if pcd:
        pass
    elif lonlat:
        adcode_district, *_ = nearest(lon, lat)
        adcode_city = settings.ADCODE[adcode_district]['father']
        adcode_province = settings.ADCODE[adcode_city]['father']
    else:
        raise serializers.ValidationError('Requires longitude and latitude')
    # if not exists then create
    if not Position.objects.filter(id=adcode_district).exists():
        district_dict = settings.ADCODE[adcode_district]
        Position.objects.create(id=adcode_district, name=district_dict['name'],
                                longitude=district_dict['longitude'], latitude=district_dict['latitude'])
    if not Position.objects.filter(id=adcode_city).exists():
        city_dict = settings.ADCODE[adcode_city]
        Position.objects.create(id=adcode_city, name=city_dict['name'],
                                longitude=city_dict['longitude'], latitude=city_dict['latitude'])
    if not Position.objects.filter(id=adcode_province).exists():
        province_dict = settings.ADCODE[adcode_province]
        Position.objects.create(id=adcode_province, name=province_dict['name'],
                                longitude=province_dict['longitude'], latitude=province_dict['latitude'])
    return n, p, c, d, s, sn, adcode_province, adcode_city, adcode_district

