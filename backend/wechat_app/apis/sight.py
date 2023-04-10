# -*- coding: utf-8 -*-
# @Time    : 2023/4/2 下午9:04
# @Author  : Su Yang
# @File    : sight.py
# @Software: PyCharm 
# @Comment :
from django.http import QueryDict
from rest_framework.decorators import action
from rest_framework.mixins import RetrieveModelMixin, CreateModelMixin
from rest_framework.viewsets import GenericViewSet

from backend import settings
from utility.models import Comment, Message
from utility.models.sight import Sight
from utils import permission, conversion
from utils.api_tools import save_log
from utils.response import *
from ..serializers import CommentSerializer
from ..serializers.sight import SightSerializer, SightBriefSerializer, SightDetailedSerializer


class SightApis(GenericViewSet, RetrieveModelMixin, CreateModelMixin):
    queryset = Sight.objects.all()
    serializer_class = SightDetailedSerializer

    @action(methods=['GET'], detail=False, url_path='brief_search')
    def brief_search(self, request):
        kw = request.query_params.get('keyword')
        sight_queryset = Sight.objects.filter(name__contains=kw)
        serializer = SightBriefSerializer(instance=sight_queryset, many=True)
        return Response(serializer.data)

    @action(methods=['GET'], detail=False, url_path='search')
    def search(self, request):
        kw = request.query_params.get('keyword')
        sight_queryset = Sight.objects.filter(name__contains=kw)
        serializer = SightSerializer(instance=sight_queryset, many=True)
        return Response(serializer.data)

    def comment_retrieve(self, request, *args, **kwargs):
        direct = conversion.get_bool(request.GET, 'direct')
        if direct:
            queryset = Comment.objects.filter(sight_master=self.get_object(), deleted=False, reply=None)
        else:
            queryset = Comment.objects.filter(sight_master=self.get_object(), deleted=False)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CommentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = CommentSerializer(queryset, many=True)
        return Response(serializer.data)

    def comment_create(self, request, *args, **kwargs):
        owner_id = permission.user_check(request)
        if owner_id <= 0:
            return error_response(Error.NOT_LOGIN, 'Please login.', status=status.HTTP_403_FORBIDDEN)
        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()
        data['owner'] = owner_id
        data['type'] = settings.COMMENT_TYPE_SIGHT
        serializer = CommentSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        obj = self.get_object()
        comment.sight_master = obj
        comment.save()

        reply = comment.reply
        if reply:
            root = reply.reply_root
            if root:
                comment.reply_root = root
            else:
                comment.reply_root = reply
            comment.save()

        if comment.reply:
            if owner_id != comment.reply.owner_id:
                Message.create_message(comment.owner, comment.reply.owner, settings.MESSAGE_TYPE_COMMENT_ON_COMMENT,
                                       comment=comment.reply)
        # Log
        save_log(user_id=owner_id, action=settings.LOG_COMMENT_CREATE, target_id=obj.id)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @permission.white_action(methods=['GET', 'POST'], detail=True, url_path='comment')
    def comments(self, request, *args, **kwargs):
        if request.method == 'POST':
            return self.comment_create(request, *args, **kwargs)
        return self.comment_retrieve(request, *args, **kwargs)
