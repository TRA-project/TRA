from .address import AddressSerializer
from utility.models import Hotel, Address
from rest_framework import serializers

class HotelSerializer(serializers.ModelSerializer):
    address = AddressSerializer(required=False, allow_null=True)

    class Meta:
        model = Hotel
        exclude = []
    
    def create(self, validated_data):
        address_data = validated_data.pop('address')
        address = Address.objects.create(**address_data)
        hotel = Hotel.objects.create(address = address, **validated_data)
        return hotel