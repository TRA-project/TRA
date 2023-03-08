from rest_framework import serializers
from app.models.admin_message import AdminMessage
from utilities.mixins import PrimaryKeyNestedField
from .user import UserSerializer

class AdminMessageSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)
    content = serializers.CharField(allow_null=False)

    class Meta:
        model = AdminMessage
        exclude = []
