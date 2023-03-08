from rest_framework import serializers
from app.models import AppUser, Travel, Message
from app.serializers import AddressSerializer
from utilities import encrypt
from utilities.mixins import PrimaryKeyNestedField
from app.models import Address
from app.serializers import AddressSerializer

class UserSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    position = PrimaryKeyNestedField(serializer=AddressSerializer, required=False)
    #subscription = serializers.PrimaryKeyRelatedField(many=True, queryset=AppUser.objects.all(), required=False)
    #collection = serializers.PrimaryKeyRelatedField(many=True, queryset=Travel.objects.all(), required=False)
    #received_messages = serializers.PrimaryKeyRelatedField(many=True, queryset=Message.objects.all())
    cities = serializers.SerializerMethodField('count_cities')
    travels = serializers.SerializerMethodField('count_travels')

    subscription = serializers.SerializerMethodField('count_subscription')
    subscribers = serializers.SerializerMethodField('count_subscribers')
    likes = serializers.SerializerMethodField('count_likes')
    collection = serializers.SerializerMethodField('count_collection')
    received_messages = serializers.SerializerMethodField('count_messages')

    def count_subscription(self, obj: AppUser):
        return obj.subscription.count()

    def count_subscribers(self, obj: AppUser):
        return obj.subscribers.count()

    def count_collection(self, obj: AppUser):
        return obj.collection.count()

    def count_messages(self, obj: AppUser):
        return obj.received_messages.count()

    def count_likes(self, obj: AppUser):
        return obj.liked_records.count()

    def count_cities(self, obj: AppUser):
        return Address.objects.filter(travel_record__forbidden=False, travel_record__owner=obj).count()

    def count_travels(self, obj: AppUser):
        return obj.travel_records.filter(forbidden=False).count()

    def create(self, validated_data):
        validated_data['password'] = encrypt.sha256(validated_data['password'])
        position = validated_data.get('position', None)
        if position is not None:
            validated_data['position'] = Address.objects.create(**position)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        pw = validated_data.get('password', None)
        if pw is not None:
            validated_data['password'] = encrypt.sha256(pw)
        position = validated_data.get('position', None)
        if position is not None:
            if instance.position:
                validated_data['position'], *_ = Address.objects.update_or_create(defaults=position, id=instance.position_id)
            else:
                validated_data['position'] = Address.objects.create(**position)
        return super().update(instance, validated_data)

    class Meta:
        model = AppUser
        exclude = ['unread_messages']
        ref_name = "Admin_AppUser"
