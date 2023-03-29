from rest_framework import serializers
from user.models import Companion
from .user import UserSerializer
from utils.mixins import PrimaryKeyNestedField
from user.models import Address, Tag
from user.serializers import AddressSerializer, ScheduleSerializer


class CompanionSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)
    fellows = PrimaryKeyNestedField(serializer=UserSerializer, many=True, required=False)
    position = AddressSerializer(required=False, allow_null=True)
    tag = serializers.PrimaryKeyRelatedField(required=False, many=True, read_only=False, queryset=Tag.objects.all())
    schedule = PrimaryKeyNestedField(serializer=ScheduleSerializer, required=False)

    def create(self, validated_data):
        position = validated_data.get('position', None)
        if position is not None:
            validated_data['position'] = Address.objects.create(**position)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        position = validated_data.get('position', None)
        if position is not None:
            if instance.position:
                validated_data['position'], *_ = Address.objects.update_or_create(defaults=position,
                                                                                  id=instance.position_id)
            else:
                validated_data['position'] = Address.objects.create(**position)
        return super().update(instance, validated_data)

    class Meta:
        model = Companion
        exclude = []
        ref_name = "Admin_Companion"
