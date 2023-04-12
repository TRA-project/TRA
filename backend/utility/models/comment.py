from django.conf import settings
from django.db import models

from .appuser import AppUser


class Comment(models.Model):
    """
    Foreign keys:

    master - Travel
    responses - Comment
    """
    type = models.IntegerField(default=settings.COMMENT_TYPE_TRAVEL)
    owner = models.ForeignKey(AppUser, on_delete=models.SET_NULL, null=True, related_name='comments')
    time = models.DateTimeField(auto_now_add=True)
    content = models.TextField(default='', max_length=settings.MAX_COMMENT_CONTENT_LENGTH)
    likes = models.ManyToManyField(AppUser, related_name='liked_comments')
    reply = models.ForeignKey('Comment', on_delete=models.SET_NULL, null=True, related_name='responses')
    reply_root = models.ForeignKey('Comment', on_delete=models.SET_NULL, null=True, related_name='recursive_responses')
    deleted = models.BooleanField(default=False)

    master = models.ForeignKey('TravelNotes', related_name='comments', null=True, default=None, on_delete=models.CASCADE)
    companion_master = models.ForeignKey('Companion', related_name='comments', null=True, default=None, on_delete=models.CASCADE)
