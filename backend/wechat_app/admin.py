from django.contrib import admin
from django.utils.html import format_html

# Register your models here.
from utility.models import Sight, Image
from utility.models.sight import SightUpdateRequest


@admin.register(SightUpdateRequest)
class SightUpdateRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'update_request', 'status')
    list_filter = ('status',)
    actions = ['approve_requests', 'reject_requests']

    @admin.display("approve_requests")
    def approve_requests(self, request, queryset):
        for request in queryset:
            request.status = 'approved'
            request.save()
            # TODO:在这里执行将修改写入到数据库的逻辑

    @admin.display("reject_requests")
    def reject_requests(self, request, queryset):
        for request in queryset:
            request.status = 'rejected'
            request.save()
