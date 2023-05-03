from rest_framework import serializers

from utility.models import Address
from utils.location import encode_addr


class AddressSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    position = serializers.PrimaryKeyRelatedField(read_only=True)

    default_error_messages = {
        'typeerror': 'Expected type {type}, got \'{realtype}\'',
    }

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            self.fail('typeerror', type=dict.__name__, realtype=data.__class__.__name__)
        res = super().to_internal_value(data)
        address = data.get('address', None)
        lon = data.get('longitude', None)
        lat = data.get('latitude', None)
        if address is not None:
            if not isinstance(address, dict):
                self.fail('typeerror', type=dict.__name__, realtype=data.__class__.__name__)
            try:
                n, p, c, d, s, sn, adcode_province, adcode_city, adcode_district = encode_addr(address, lon, lat)
                res.update(address)
                res.update(position_id=adcode_district,
                           city_position_id=adcode_city,
                           province_position_id=adcode_province)
            except (KeyError, ValueError, TypeError) as e:
                raise serializers.ValidationError('Invalid address format: %s' % e)
            except serializers.ValidationError:
                raise
            except Exception as e:
                print(e)
                raise
        return res

    class Meta:
        model = Address
        exclude = ['city_position', 'province_position']


class AddressPlanSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    position = serializers.PrimaryKeyRelatedField(read_only=True)

    default_error_messages = {
        'typeerror': 'Expected type {type}, got \'{realtype}\'',
    }

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            self.fail('typeerror', type=dict.__name__, realtype=data.__class__.__name__)
        res = super().to_internal_value(data)
        address = data.get('address', None)
        lon = data.get('longitude', None)
        lat = data.get('latitude', None)
        if address is not None:
            if not isinstance(address, dict):
                self.fail('typeerror', type=dict.__name__, realtype=data.__class__.__name__)
            try:
                n, p, c, d, s, sn, adcode_province, adcode_city, adcode_district = encode_addr(address, lon, lat)
                res.update(address)
                res.update(position_id=adcode_district,
                           city_position_id=adcode_city,
                           province_position_id=adcode_province)
            except (KeyError, ValueError, TypeError) as e:
                raise serializers.ValidationError('Invalid address format: %s' % e)
            except serializers.ValidationError:
                raise
            except Exception as e:
                print(e)
                raise
        return res

    class Meta:
        model = Address
        exclude = ['province_position']
