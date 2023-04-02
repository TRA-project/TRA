from rest_framework import serializers
from utility.models import TravelNotes
from utility.models import ReadRecord
from utils import mixins
from .user import UserSerializer
from utils.mixins import PrimaryKeyNestedField
from utility.models import Address
from wechat_app.serializers import AddressSerializer, ScheduleSerializer, TravelCollectionSerializer


class ReadRecordSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = ReadRecord
        exclude = []


class TravelNotesSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    owner = PrimaryKeyNestedField(serializer=UserSerializer, required=False)
    # comments = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    # positions = serializers.PrimaryKeyRelatedField(many=True, queryset=Position.objects.all())
    # read_records = ReadRecordSerializer(many=True, read_only=True, allow_null=True)
    cover = serializers.PrimaryKeyRelatedField(read_only=True)
    images = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    position = AddressSerializer(required=False, allow_null=True)
    likes = serializers.SerializerMethodField('count_likes')
    count_comments = serializers.SerializerMethodField('_count_comments')
    collection = mixins.PrimaryKeyNestedField(serializer=TravelCollectionSerializer)
    schedule = mixins.PrimaryKeyNestedField(required=False, serializer=ScheduleSerializer)

    def count_likes(self, obj):
        return obj.likes.count()

    def _count_comments(self, obj):
        return obj.comments.count()

    def create(self, validated_data):
        position = validated_data.get('position', None)
        if position is not None:
            validated_data['position'] = Address.objects.create(**position)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        position = validated_data.get('position', None)
        if position is not None:
            if instance.position:
                validated_data['position'], *_ = Address.objects.update_or_create(defaults=position,
                                                                                  id=instance.position_id)
            else:
                validated_data['position'] = Address.objects.create(**position)
        return super().update(instance, validated_data)

    class Meta:
        model = TravelNotes
        exclude = []
        ref_name = "Admin_Travel"
