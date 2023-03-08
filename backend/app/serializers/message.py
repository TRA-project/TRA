from rest_framework import serializers
from app.models.message import Message
from .schedule import ScheduleItemSerializer
from .travel import TravelSerializer
from .comment import CommentSerializer
from .companion import CompanionSerializer
from .user import UserSerializer, AppUser
from .flight import FlightBaseSerializer
from utilities.mixins import PrimaryKeyNestedField
from django.conf import settings

class MessageSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)
    related_travel = PrimaryKeyNestedField(serializer=TravelSerializer)
    related_comment = PrimaryKeyNestedField(serializer=CommentSerializer)
    related_companion = PrimaryKeyNestedField(serializer=CompanionSerializer)
    related_scheduleitem = PrimaryKeyNestedField(serializer=ScheduleItemSerializer)
    related_flight = PrimaryKeyNestedField(serializer=FlightBaseSerializer)
    description = serializers.SerializerMethodField('get_description')

    def get_description(self, obj):
        return settings.MESSAGE_TYPES_DESCRIPTION.get(obj.type,
            settings.MESSAGE_TYPES_DESCRIPTION[settings.MESSAGE_TYPES_DEFAULT])

    class Meta:
        model = Message
        exclude = []
