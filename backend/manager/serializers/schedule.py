from rest_framework import serializers
from user.models import Address, Schedule, ScheduleItem
from .user import UserSerializer
from user.serializers import AddressSerializer
from utils import mixins

class ScheduleItemSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    position = AddressSerializer(required=False, allow_null=True)

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
        model = ScheduleItem
        fields = ["id", "start_time", "end_time", "position", "content",
                  "budget", "real_consumption", "if_alarm", "schedule"]
        ref_name = "Admin_ScheduleItem"


class ScheduleBriefSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = mixins.PrimaryKeyNestedField(serializer=UserSerializer)

    class Meta:
        model = Schedule
        fields = ["id", "owner", "create_time", "date", "title",
                  "remarks", "visibility", "forbidden",  "forbidden_reason"]
        ref_name = "Admin_ScheduleBrief"


class ScheduleSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = mixins.PrimaryKeyNestedField(serializer=UserSerializer)
    schedule_items = ScheduleItemSerializer(required=False, allow_null=True, many=True)

    class Meta:
        model = Schedule
        fields = ["id", "owner", "create_time", "date", "title",
                  "remarks", "visibility", "forbidden", "forbidden_reason", "schedule_items"]
        ref_name = "Admin_Schedule"