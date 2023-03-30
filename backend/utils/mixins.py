import os as _os
from rest_framework.mixins import *
from rest_framework.serializers import PrimaryKeyRelatedField, ImageField, Field


class BulkDestroyModelMixin:
    """
    Destroy model instances.
    """

    def bulk_destroy(self, request, *args, **kwargs):
        instances = self.filter_queryset(self.get_queryset())
        self.perform_bulk_destroy(instances)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_bulk_destroy(self, instances):
        instances.delete()


class PrimaryKeyNestedField(PrimaryKeyRelatedField):
    def __init__(self, **kwargs):
        self.serializer = kwargs.pop('serializer', None)
        if not 'queryset' in kwargs and self.serializer:
            try:
                kwargs['queryset'] = self.serializer.Meta.model.objects.all()
            except:
                pass
        super().__init__(**kwargs)

    def to_representation(self, value):
        if self.serializer is None:
            return super().to_representation(value)
        if self.queryset is not None:
            objs = self.queryset.filter(pk=value.pk)
            if objs:
                return self.serializer(objs.first()).data
        return super().to_representation(value)

    def to_internal_value(self, data):
        return super().to_internal_value(data)


class ImageNameField(ImageField):
    def __init__(self, *, name_truncate=None, **kwargs):
        if not isinstance(name_truncate, int):
            self.name_truncate = 0
        else:
            self.name_truncate = name_truncate
        super().__init__(**kwargs)

    def to_representation(self, value):
        return _os.path.basename(value.name)[self.name_truncate:]

    def to_internal_value(self, data):
        return super().to_internal_value(data)


class WritableMethodField(Field):
    def __init__(self, method_name=None, set_method_name=None, **kwargs):
        self.get_method_name = method_name
        self.set_method_name = set_method_name
        kwargs['source'] = '*'
        super().__init__(**kwargs)

    def bind(self, field_name, parent):
        default_get_method_name = 'get_{field_name}'.format(field_name=field_name)
        default_set_method_name = 'set_{field_name}'.format(field_name=field_name)

        if self.get_method_name is None:
            self.get_method_name = default_get_method_name
        if self.set_method_name is None:
            self.set_method_name = default_set_method_name

        super().bind(field_name, parent)

    def to_representation(self, value):
        method = getattr(self.parent, self.get_method_name, self._default_to_representation)
        return method(value)

    def to_internal_value(self, data):
        method = getattr(self.parent, self.set_method_name, self._default_to_internal_value)
        return method(data)

    def _default_to_representation(self, value):
        return getattr(value, self.field_name)

    def _default_to_internal_value(self, data):
        return {self.field_name: data}
