from rest_framework import serializers
from app.models.comment import Comment
from .user import UserSerializer
from utilities.mixins import PrimaryKeyNestedField


class CommentSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)

    class Meta:
        model = Comment
        exclude = []
        ref_name = "Admin_Comment"
