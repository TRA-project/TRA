from rest_framework import serializers
from user.models import FeedBack
from utils.mixins import PrimaryKeyNestedField
from .user import UserSerializer

class AdminMessageSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)

    class Meta:
        model = FeedBack
        exclude = []
        ref_name = "Admin_AdminMessage"
