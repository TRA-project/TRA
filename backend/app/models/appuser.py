from functools import partial

from django.db import models
from django.conf import settings

from utilities import uuid, jwt, date
from .flight import Flight

from .position import Position
from .address import Address
from .images import Image

class AppUser(models.Model):
    """
    Foreign keys:

    travel_records - Travel
    liked_records - Travel
    comments - Comment
    liked_comments - Comment
    sent_messages - Message
    """

    #id = models.CharField(max_length=32, primary_key=True, default=partial(uuid.uuid, namespace=settings.USER_ID_NAMESPACE))
    name = models.CharField(max_length=settings.MAX_USER_NAME_LEN, unique=True)
    password = models.CharField(max_length=settings.MAX_USER_PASSWORD_LEN)
    openid = models.CharField(max_length=settings.OPENID_LEN, unique=True, null=True)

    nickname = models.CharField(max_length=settings.MAX_USER_REALNAME_LEN, default='', blank=True)
    gender = models.IntegerField(default=settings.GENDERS_DEFAULT)
    sign = models.CharField(max_length=settings.MAX_USER_SIGN_LEN, default='', blank=True)
    email = models.CharField(max_length=settings.MAX_USER_EMAIL_LEN, default='', blank=True)
    phone = models.CharField(max_length=settings.MAX_USER_PHONE_LEN, default='', blank=True)
    birthday = models.DateField(null=True)
    icon = models.ForeignKey(Image, related_name='user', null=True, on_delete=models.CASCADE)

    time = models.DateTimeField(auto_now_add=True)

    position = models.OneToOneField(Address, related_name='user', null=True, on_delete=models.SET_NULL)

    subscription = models.ManyToManyField('AppUser', related_name='subscribers')
    collection = models.ManyToManyField('Travel', related_name='collectors')
    received_messages = models.ManyToManyField('Message', related_name='target_users')
    unread_messages = models.ManyToManyField('Message', related_name='unread_users')

    last_login_time = models.DateTimeField(default=date.now)
    cluster = models.PositiveIntegerField(default=0)

    def first_likes(self):
        return self.liked_records.order_by('-time')[:settings.RECOMMEND_LIKE_AMOUNT]

    def jwt_token(self):
        return jwt.jwt_token(settings.USER_JWT_KEY, payload={'id': self.id})

    last_admin_message_time = models.DateTimeField(default=date.now)
