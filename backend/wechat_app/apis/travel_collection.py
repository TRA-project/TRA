from django.http import QueryDict
from rest_framework import viewsets
from rest_framework.decorators import action

from utils.api_tools import save_log
from utils.response import *
from utility.models import TravelNotesCollection
from wechat_app.serializers import TravelCollectionSerializer, TravelCollectionDetailedSerializer
from django.conf import settings
from utils import permission, filters
from django.db.models import Q


class TravelCollectionFilterBackend(filters.QueryFilterBackend):
    default_ordering_rule = 'create_time'

    def filter_queryset(self, request, queryset, view):
        owner = permission.user_check(request)

        queryset = super().filter_queryset(request, queryset.filter(owner_id=owner), view)
        return queryset


class TravelCollectionApis(viewsets.ModelViewSet):
    filter_backends = [TravelCollectionFilterBackend]
    permission_classes = [permission.ContentPermission]
    queryset = TravelNotesCollection.objects.all()
    serializer_class = TravelCollectionSerializer

    def create(self, request, *args, **kwargs):
        request_user = permission.user_check(request)

        data = request.data
        if isinstance(data, QueryDict):
            data = data.dict()
        data['owner'] = request_user

        title = request.data.get('title', None)
        if title is None:
            return error_response(Error.COLLECTION_NO_TITLE, 'Please offer a title.')
        elif TravelNotesCollection.objects.all().filter(Q(owner_id=request_user) & Q(title=title)):
            return error_response(Error.COLLECTION_TITLE_DUPLICATED, 'The title name already exists.')

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        obj = serializer.instance

        # Log
        save_log(user_id=request_user, action=settings.LOG_TRAVELCOLLECTION_CREATE, target_id=obj.id)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        request_user = permission.user_check(request)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        title = request.data.get('title', None)
        if instance.title == settings.DEFAULT_TITLE_NAME and title is not None:
            return error_response(Error.COLLECTION_TITLE_UNCHANGEABLE, 'The default collection name cannot be changed.')
        if TravelNotesCollection.objects.all().filter(Q(owner_id=request_user) & Q(title=title)):
            return error_response(Error.COLLECTION_TITLE_DUPLICATED, 'The title name already exists.')
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        # Log
        save_log(user_id=request_user, action=settings.LOG_TRAVELCOLLECTION_EDIT, target_id=instance.id)

        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = TravelCollectionDetailedSerializer(instance)
        data = serializer.data
        return Response(data)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({"results": serializer.data})

    def destroy(self, request, *args, **kwargs):
        request_user = permission.user_check(request)

        instance = self.get_object()
        if instance.title == settings.DEFAULT_TITLE_NAME:
            return error_response(Error.COLLECTION_TITLE_UNDELETED, 'The default collection name cannot be deleted.')

        # Log
        save_log(user_id=request_user, action=settings.LOG_TRAVELCOLLECTION_DELETE, target_id=instance.id)

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['GET'], detail=False, url_path='all')
    def all(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = TravelCollectionDetailedSerializer(queryset, many=True)
        return Response({"results": serializer.data})
