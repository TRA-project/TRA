from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from django.db.models import Q

from django.conf import settings
from utility.models import TravelNotes, Image, Message
from web.serializers import TravelNotesSerializer
from utils.conversion import get_list
from utils.response import *
from utils import conversion, filters, date
from django.core.files.uploadedfile import UploadedFile


class TravelNotesFilterBackend(filters.QueryFilterBackend):
    filter_fields = [
        ('id', 'id', 'exact'),
        ('forbidden', 'forbidden'),
        ('owner', 'owner_id', 'exact'),
        ('position', 'position__position__id', 'exact'),
    ]
    default_ordering_rule = '-time'

    def filter_queryset(self, request, queryset, view):
        query_content = request.query_params.get('content', None)
        if query_content:
            queryset = queryset.filter(Q(title__contains=query_content) | \
                                       Q(owner__name__contains=query_content))
        tags = request.query_params.get('tag', None)
        if tags is not None:
            tags = tags.split(' ')
            for tag in tags:
                if tag == '': continue
                queryset = queryset.filter(tag=tag)
        queryset = super().filter_queryset(request, queryset, view)
        return queryset


class TravelNotesApis(viewsets.ModelViewSet):
    filter_backends = [TravelNotesFilterBackend]
    permission_classes = [permissions.IsAuthenticated]
    queryset = TravelNotes.objects.all()
    serializer_class = TravelNotesSerializer

    def bulk_destroy(self, request, *args, **kwargs):
        ids = get_list(request.data, 'id')
        objs = self.get_queryset().filter(id__in=ids)
        objs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['POST'], detail=True, url_path='images')
    def image_list(self, request, *args, **kwargs):
        imglist = get_list(request.data, 'id')
        images = Image.objects.filter(id__in=imglist)
        obj = self.get_object()
        obj.images.set(images)
        return self.retrieve(None)

    @action(methods=['POST'], detail=True, url_path='cover')
    def cover(self, request, *args, **kwargs):
        img = request.data.get('id', None)
        imgobj = None
        if img:
            images = Image.objects.filter(id=img)
            if images:
                imgobj = images.first()
        if not imgobj:
            imgfile = request.data.get('image', None)
            if imgfile is None or not isinstance(imgfile, UploadedFile):
                return error_response(status.HTTP_400_BAD_REQUEST, 'Invalid image.', status=status.HTTP_400_BAD_REQUEST)
            desc = request.data.get('description', '')
            imgobj = Image.objects.create(image=imgfile, description=desc)
        obj = self.get_object()
        if obj.cover is not None:
            obj.cover.delete()
        obj.cover = imgobj
        obj.save()
        return self.retrieve(None)

    @action(methods=['POST'], detail=False, url_path='forbid')
    def forbid(self, request, *args, **kwargs):
        ids = get_list(request.data, 'id')
        stat = conversion.get_int(request.data, 'status')
        if stat is None:
            stat = settings.TRAVEL_FORBIDDEN_TRUE
        reason = conversion.get_str(request.data, 'reason')
        objs = TravelNotes.objects.filter(id__in=ids)
        query = {
            'forbidden': stat,
        }
        if reason is not None:
            query['forbidden_reason'] = reason
        objs.update(**query)
        if stat == settings.TRAVEL_FORBIDDEN_FALSE:
            for obj in objs:
                forbid = Message.objects.filter(target_users__id=obj.owner_id, related_travel_id=obj.id,
                                                type=settings.MESSAGE_TYPE_TRAVEL_FORBIDDEN)
                if forbid:
                    forbid: Message = forbid.first()
                    forbid.time = date.now()
                    forbid.type = settings.MESSAGE_TYPE_TRAVEL_FORBIDDEN_CANCEL
                    obj.owner.unread_messages.remove(forbid)
                else:
                    cancel = Message.objects.filter(target_users__id=obj.owner_id, related_travel_id=obj.id,
                                                    type=settings.MESSAGE_TYPE_TRAVEL_FORBIDDEN_CANCEL)
                    if not cancel:
                        Message.create_message(None, obj.owner, type=settings.MESSAGE_TYPE_TRAVEL_FORBIDDEN_CANCEL,
                                               travel=obj)
        else:
            for obj in objs:
                cancel = Message.objects.filter(target_users__id=obj.owner_id, related_travel_id=obj.id,
                                                type=settings.MESSAGE_TYPE_TRAVEL_FORBIDDEN_CANCEL)
                if cancel:
                    cancel: Message = cancel.first()
                    cancel.time = date.now()
                    cancel.type = settings.MESSAGE_TYPE_TRAVEL_FORBIDDEN
                    obj.owner.unread_messages.remove(cancel)
                else:
                    forbid = Message.objects.filter(target_users__id=obj.owner_id, related_travel_id=obj.id,
                                                    type=settings.MESSAGE_TYPE_TRAVEL_FORBIDDEN)
                    if not forbid:
                        Message.create_message(None, obj.owner, type=settings.MESSAGE_TYPE_TRAVEL_FORBIDDEN, travel=obj)
        return Response(self.get_serializer(objs, many=True).data)
