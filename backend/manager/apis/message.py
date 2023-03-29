from rest_framework import viewsets, permissions
from rest_framework.decorators import action

from user.models import Message, AppUser
from manager.serializers import MessageSerializer
from utils import conversion, filters

class MessageApis(viewsets.ModelViewSet):
    filter_backends = [filters.QueryFilterBackend.custom(
        ('type', 'type'),
        ('content', 'content', 'contains'),
        ('owner', 'owner.id'),
        ('receiver', 'target_users.id'),
        ordering_rule='-time')]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    @action(methods=['POST'], detail=True, url_path='send')
    def send(self, request, *args, **kwargs):
        ids = conversion.get_list(request.data, 'id')
        if ids:
            users = AppUser.objects.filter(id__in=ids)
        else:
            users = AppUser.objects.all()
        self.get_object().target_users.add(*users)
        return self.retrieve(request, *args, **kwargs)
