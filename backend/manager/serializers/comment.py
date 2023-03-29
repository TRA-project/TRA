from rest_framework import serializers
from user.models import Comment
from .user import UserSerializer
from utils.mixins import PrimaryKeyNestedField


class CommentSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)

    class Meta:
        model = Comment
        exclude = []
        ref_name = "Admin_Comment"
