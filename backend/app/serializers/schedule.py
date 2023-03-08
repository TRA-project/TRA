from rest_framework import serializers
from app.models import AppUser, Address, Position, Flight, Schedule, ScheduleItem
from .user import UserSerializer, AppUser
from .address import AddressSerializer
from utilities import mixins


class ScheduleItemSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    position = AddressSerializer(required=False, allow_null=True)
    date = serializers.SerializerMethodField('get_date')

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

    def get_date(self, instance):
        return instance.schedule.date

    class Meta:
        model = ScheduleItem
        fields = ["id", "start_time", "end_time", "position", "content",
                  "budget", "real_consumption", "if_alarm", "schedule", "date"]


class ScheduleBriefSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = mixins.PrimaryKeyNestedField(required=False, serializer=UserSerializer)

    class Meta:
        model = Schedule
        fields = ["id", "owner", "create_time", "date", "title",
                  "remarks", "visibility", "forbidden"]


class ScheduleSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = mixins.PrimaryKeyNestedField(required=False, serializer=UserSerializer)
    schedule_items = ScheduleItemSerializer(required=False, allow_null=True, many=True)

    class Meta:
        model = Schedule
        fields = ["id", "owner", "create_time", "date", "title",
                  "remarks", "visibility", "forbidden", "schedule_items"]
