from rest_framework import serializers
from user.models import AppUser, Address
from .address import AddressSerializer


class UserSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    position = AddressSerializer(required=False, allow_null=True)
    cities = serializers.SerializerMethodField('count_cities')
    travels = serializers.SerializerMethodField('count_travels')
    subscription = serializers.SerializerMethodField('count_subscription')
    subscribers = serializers.SerializerMethodField('count_subscribers')

    def count_subscription(self, obj: AppUser):
        return obj.subscription.count()

    def count_subscribers(self, obj: AppUser):
        return obj.subscribers.count()

    def count_cities(self, obj: AppUser):
        return Address.objects.filter(travel_record__forbidden=False, travel_record__owner=obj).values_list('position__id', flat=True).distinct().count()

    def count_travels(self, obj: AppUser):
        return obj.travel_records.filter(forbidden=False).count()

    def validate_position(self, value):
        return value

    def create(self, validated_data):
        position = validated_data.get('position', None)
        if position is not None:
            validated_data['position'] = Address.objects.create(**position)

        return super().create(validated_data)

    def update(self, instance: AppUser, validated_data):
        position = validated_data.get('position', None)
        if position is not None:
            if instance.position:
                validated_data['position'], *_ = Address.objects.update_or_create(defaults=position, id=instance.position_id)
            else:
                validated_data['position'] = Address.objects.create(**position)
        return super().update(instance, validated_data)

    class Meta:
        model = AppUser
        exclude = ['time', 'password', 'collection', 'received_messages', 'unread_messages', 'openid',
                   'cluster', 'last_admin_message_time']
