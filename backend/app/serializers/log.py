from rest_framework import serializers
from app.models import Log
from app.serializers import UserSerializer
from utilities.mixins import PrimaryKeyNestedField


class LogSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    user = PrimaryKeyNestedField(serializer=UserSerializer)

    class Meta:
        model = Log
        fields = ["id", "time", "user", "action", "target_id", "remarks"]
