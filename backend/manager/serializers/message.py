from rest_framework import serializers
from user.models import Message
from .user import UserSerializer
from utils.mixins import PrimaryKeyNestedField

class MessageSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    send_from = PrimaryKeyNestedField(serializer=UserSerializer, required=False)

    class Meta:
        model = Message
        exclude = []
        ref_name = "Admin_Message"
