from rest_framework import serializers
from utility.models.position import Position
from utility.models import Address
from utils import location


class AddressSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    position = serializers.PrimaryKeyRelatedField(read_only=True)

    default_error_messages = {
        'typeerror': 'Expected type {type}, got \'{realtype}\'',
    }

    def to_representation(self, data):
        return super().to_representation(data)

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            self.fail('typeerror', type=dict.__name__, realtype=data.__class__.__name__)
        res = super().to_internal_value(data)
        address = data.get('address', None)
        lon = data.get('longitude', None)
        lat = data.get('latitude', None)
        if lon is not None and lat is not None:
            lonlat = True
        else:
            lonlat = False
        if address is not None:
            if not isinstance(address, dict):
                self.fail('typeerror', type=dict.__name__, realtype=data.__class__.__name__)
            try:
                n, p, c, d, s, sn = address['nation'], address['province'], address['city'], address['district'], \
                address['street'], address['street_number']
                ps = Position.objects.filter(name=d)
                if ps:
                    adcode = ps.first().id
                    adcode_city = adcode[:4] + '00'
                    adcode_province = adcode_city[:2] + '0000'
                elif lonlat:
                    adcode, *_ = location.nearest(lon, lat)
                    ps = Position.objects.filter(name=c)
                    if ps:
                        adcode_city = ps.first().id
                        adcode_province = adcode_city[:2] + '0000'
                    else:
                        adcode_city = adcode[:4] + '00'
                        ps = Position.objects.filter(name=p)
                        if ps:
                            adcode_province = ps.first().id
                        else:
                            adcode_province = adcode_city[:2] + '0000'
                else:
                    raise serializers.ValidationError('Requires longitude and latitude')
                res.update(address)
                res.update(position_id=adcode, city_position_id=adcode_city, province_position_id=adcode_province)
            except (KeyError, ValueError, TypeError) as e:
                raise serializers.ValidationError('Invalid address format: %s' % (e))
            except serializers.ValidationError:
                raise
            except Exception as e:
                print(e)
                raise
        return res

    class Meta:
        model = Address
        exclude = ['city_position', 'province_position']
