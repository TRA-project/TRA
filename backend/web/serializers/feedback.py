from rest_framework import serializers
from utility.models import FeedBack
from utils.mixins import PrimaryKeyNestedField
from .user import UserSerializer


class FeedbackSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)

    class Meta:
        model = FeedBack
        exclude = []
        ref_name = "Admin_AdminMessage"
