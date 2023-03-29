from rest_framework import serializers
from user.models import Log
from user.serializers import UserSerializer
from utils.mixins import PrimaryKeyNestedField


class LogSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    user = PrimaryKeyNestedField(serializer=UserSerializer)

    class Meta:
        model = Log
        fields = ["id", "time", "user", "action", "target_id", "remarks"]
