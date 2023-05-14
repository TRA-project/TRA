from rest_framework import viewsets
from django.http import QueryDict

from django.conf import settings
from utility.models import Feedback, AppUser
from wechat_app.serializers import FeedbackSerializer
from utils.response import *
from utils import permission as _permission, date


class FeedbackApis(viewsets.GenericViewSet, viewsets.mixins.CreateModelMixin):
    permission_classes = []
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    def create(self, request, *args, **kwargs):
        owner_id = _permission.user_check(request)
        if owner_id <= 0:
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        user = AppUser.objects.filter(id=owner_id)
        if not user:
            return error_response(Error.INVALID_USER, 'Invalid user.', status=status.HTTP_400_BAD_REQUEST)
        user = user.first()

        time_limit = user.last_admin_message_time + date.delta(settings.ADMIN_MESSAGE_TIME_LIMIT)
        now = date.now()
        if now < time_limit:
            return error_response(Error.ADMIN_MESSAGE_TIME_LIMIT, f'{date.format(time_limit)}',
                                  status=status.HTTP_403_FORBIDDEN)

        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()

        data['owner'] = owner_id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        user.last_admin_message_time = now
        user.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
