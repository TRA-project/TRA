from rest_framework import viewsets, permissions
from rest_framework.decorators import action

from django.conf import settings
from user.models import Companion, Message
from utils.response import *
from manager.serializers import CompanionSerializer
from utils import conversion, date
from user.apis import CompanionFilterBackend


class CompanionApis(viewsets.ModelViewSet):
    filter_backends = [CompanionFilterBackend]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Companion.objects.all()
    serializer_class = CompanionSerializer

    def bulk_destroy(self, request, *args, **kwargs):
        ids = conversion.get_list(request.data, 'id')
        objs = self.get_queryset().filter(id__in=ids)
        objs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['POST'], detail=False, url_path='forbid')
    def forbid(self, request, *args, **kwargs):
        ids = conversion.get_list(request.data, 'id')
        stat = conversion.get_int(request.data, 'status')
        if stat is None:
            stat = settings.TRAVEL_FORBIDDEN_TRUE
        reason = conversion.get_str(request.data, 'reason')
        objs = Companion.objects.filter(id__in=ids)
        query = {
            'forbidden': stat,
        }
        if reason is not None:
            query['forbidden_reason'] = reason
        objs.update(**query)
        if stat == settings.TRAVEL_FORBIDDEN_FALSE:
            for obj in objs:
                forbid = Message.objects.filter(target_users__id=obj.owner_id, related_companion_id=obj.id,
                                                type=settings.MESSAGE_TYPE_COMPANION_FORBIDDEN)
                if forbid:
                    forbid: Message = forbid.first()
                    forbid.time = date.now()
                    forbid.type = settings.MESSAGE_TYPE_COMPANION_FORBIDDEN_CANCEL
                    obj.owner.unread_messages.remove(forbid)
                else:
                    cancel = Message.objects.filter(target_users__id=obj.owner_id, related_companion_id=obj.id,
                                                    type=settings.MESSAGE_TYPE_COMPANION_FORBIDDEN_CANCEL)
                    if not cancel:
                        Message.create_message(None, obj.owner, type=settings.MESSAGE_TYPE_COMPANION_FORBIDDEN_CANCEL,
                                               companion=obj)
        else:
            for obj in objs:
                cancel = Message.objects.filter(target_users__id=obj.owner_id, related_companion_id=obj.id,
                                                type=settings.MESSAGE_TYPE_COMPANION_FORBIDDEN_CANCEL)
                if cancel:
                    cancel: Message = cancel.first()
                    cancel.time = date.now()
                    cancel.type = settings.MESSAGE_TYPE_COMPANION_FORBIDDEN
                    obj.owner.unread_messages.remove(cancel)
                else:
                    forbid = Message.objects.filter(target_users__id=obj.owner_id, related_companion_id=obj.id,
                                                    type=settings.MESSAGE_TYPE_COMPANION_FORBIDDEN)
                    if not forbid:
                        Message.create_message(None, obj.owner, type=settings.MESSAGE_TYPE_COMPANION_FORBIDDEN,
                                               companion=obj)
        return Response(self.get_serializer(objs, many=True).data)
