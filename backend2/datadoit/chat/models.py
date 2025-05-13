# chat/models.py
from django.db import models
from django.contrib.auth import get_user_model

from boutique.models import Boutique



User = get_user_model()

class ChatRoom(models.Model):
    ROOM_TYPES = (
        ('shop', 'Shop'),
        ('admin', 'Admin'),
    )
    name = models.CharField(max_length=255, unique=True)
    room_type = models.CharField(max_length=10, choices=ROOM_TYPES, default='shop')
    boutique = models.ForeignKey(Boutique, on_delete=models.CASCADE, null=True, blank=True)  # Changed from Shop to Boutique
    created_at = models.DateTimeField(auto_now_add=True)
    members = models.ManyToManyField(User, related_name='chat_rooms')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='customer_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')

    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['room', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.user.name} - {self.message[:50]} ({self.room.name})"

class PinnedMessage(models.Model):
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='pinned_messages')
    pinned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pinned_messages')
    pinned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-pinned_at']

    def __str__(self):
        return f"Message pinned by {self.pinned_by.name}"

class MessageReaction(models.Model):
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_reactions')
    emoji = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user', 'emoji')

    def __str__(self):
        return f"{self.user.name} reacted with {self.emoji}"

class MessageRead(models.Model):
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='read_by')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='read_messages')
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user')

    def __str__(self):
        return f"{self.user.name} read message {self.message.id}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    sender = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Notification for {self.user.name} from {self.sender}"