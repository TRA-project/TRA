from utility.models import Plan
from wechat_app.serializers.plan import PlanSerializer
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from utility.models.plan import Plan


class PlanApis(GenericViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"results": serializer.data})