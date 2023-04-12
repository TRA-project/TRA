from rest_framework import serializers
from utility.models import Comment, TravelNotes, Companion
from .user import UserSerializer
from .images import ImageSerializer
from utils.mixins import PrimaryKeyNestedField, WritableMethodField
from django.conf import settings


class CommentTravelSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    cover = ImageSerializer(read_only=True)

    class Meta:
        model = TravelNotes
        fields = ['id', 'cover', 'owner']


class CommentCompanionSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Companion
        fields = ['id', 'owner']


class CommentSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer)
    reply = serializers.PrimaryKeyRelatedField(queryset=Comment.objects.all(), required=False, allow_null=True)
    reply_root = serializers.PrimaryKeyRelatedField(read_only=True)
    content = WritableMethodField('get_content')

    parent = serializers.SerializerMethodField('get_parent')

    def get_parent(self, obj: Comment):
        if obj.type == settings.COMMENT_TYPE_TRAVEL:
            parent = obj.master
            if parent is None:
                return None
            return CommentTravelSerializer(parent).data
        elif obj.type == settings.COMMENT_TYPE_COMPANION:
            parent = obj.companion_master
            if parent is None:
                return None
            return CommentCompanionSerializer(parent).data
        return None

    def get_content(self, obj):
        if obj.deleted:
            return settings.COMMENT_DELETED_CONTENT
        return obj.content

    class Meta:
        model = Comment
        exclude = ['likes', 'master', 'companion_master']
