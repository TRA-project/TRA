from rest_framework.filters import BaseFilterBackend as _bfb
from collections.abc import Iterable, Sized
import random

from .conversion import to_bool

_transform_identical = lambda x: x


class QueryFilterBackend(_bfb):
    filter_fields = []
    ordering_param = "ordering"
    default_ordering_rule = None

    def filter_queryset(self, request, queryset, view):
        if getattr(self, '__filter_mixin_cache_fields__', None) is None:
            setattr(self, '__filter_mixin_cache_fields__', {})
            for query_field in self.filter_fields:
                if not isinstance(query_field, Sized) or not isinstance(query_field, Iterable) or len(query_field) <= 1:
                    continue
                if len(query_field) == 2:
                    param, field = query_field
                    self.__filter_mixin_cache_fields__[param] = (field.replace(".", "__"), _transform_identical)
                else:
                    param, field, method, *_ = query_field
                    trans = _transform_identical
                    if method in ('isnull',):
                        trans = to_bool
                    self.__filter_mixin_cache_fields__[param] = (field.replace(".", "__") + "__%s" % (method), trans)
        filter_args = {}
        for param, (field, trans) in self.__filter_mixin_cache_fields__.items():
            item = request.query_params.get(param)
            if item:
                filter_args[field] = trans(item)
        if filter_args:
            queryset = queryset.filter(**filter_args)
        ordering = request.query_params.get(self.ordering_param)
        if ordering:
            queryset = queryset.order_by(ordering)
        elif self.default_ordering_rule is not None:
            queryset = queryset.order_by(self.default_ordering_rule)
        return queryset

    @classmethod
    def custom(cls, *fields, ordering_param=ordering_param, ordering_rule=default_ordering_rule):
        op = ordering_param

        class _QueryFilterBackend(QueryFilterBackend):
            filter_fields = fields
            ordering_param = op
            default_ordering_rule = ordering_rule

        return _QueryFilterBackend


def random_filter(queryset, samples: int, distinct=False):
    amount = queryset.count()
    samples = random.sample(range(amount), min(samples, amount))
    id_list = [queryset[index].pk for index in samples]
    res = queryset.filter(pk__in=id_list)
    if distinct:
        res = res.distinct()
    return res


shuffle = random.shuffle
