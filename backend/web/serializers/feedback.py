from rest_framework import serializers
from utility.models import Feedback
from utils.mixins import PrimaryKeyNestedField
from .user import UserSerializer


class FeedbackSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)

    class Meta:
        model = Feedback
        exclude = []
        ref_name = "Admin_AdminMessage"
