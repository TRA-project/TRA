import math
from django.conf import settings

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
