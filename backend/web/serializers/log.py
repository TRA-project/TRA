from rest_framework import serializers
from utility.models import Log


class LogSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = Log
        fields = ["id", "time", "wechat_app", "action", "target_id", "remarks"]
        ref_name = "Admin_Log"
