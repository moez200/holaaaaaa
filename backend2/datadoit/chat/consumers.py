# chat/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from .models import ChatRoom, ChatMessage, Notification, PinnedMessage, MessageReaction, MessageRead
from boutique.models import Boutique
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.user = self.scope['user']
        self.role = self.scope['query_string'].decode().split('role=')[1].split('&')[0]
        self.boutique_id = self.scope['query_string'].decode().split('boutique_id=')[1].split('&')[0]

        # Validation de l'accès
        if not await self.validate_access():
            await self.close(code=4003)
            return

        # Rejoindre le groupe de la salle
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def validate_access(self):
        try:
            if self.role == 'marchand':
                # Vérifier que le marchand a accès à cette boutique
                boutique = await database_sync_to_async(Boutique.objects.get)(id=self.boutique_id)
                return boutique.marchand.user == self.user
            elif self.role == 'client':
                # Vérifier que le client a accès à cette boutique
                boutique = await database_sync_to_async(Boutique.objects.get)(id=self.boutique_id)
                return True  # Les clients peuvent accéder à toutes les boutiques
            return False
        except Exception as e:
            print(f"Erreur de validation d'accès: {str(e)}")
            return False

    async def disconnect(self, close_code):
        # Quitter le groupe de la salle
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'connect':
            # Gérer la connexion initiale
            await self.handle_connect(data)
        elif message_type == 'chat_message':
            # Gérer l'envoi de message
            await self.handle_chat_message(data)
        elif message_type == 'get_customers':
            # Récupérer la liste des clients
            await self.handle_get_customers(data)
        elif message_type == 'get_members':
            # Récupérer la liste des membres
            await self.handle_get_members(data)
        elif message_type == 'get_notifications':
            # Récupérer les notifications
            await self.handle_get_notifications(data)

    async def handle_connect(self, data):
        # Envoyer un message de confirmation de connexion
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connexion établie avec succès'
        }))

    async def handle_chat_message(self, data):
        message = data.get('message')
        customer_id = data.get('customer_id')
        boutique_id = data.get('boutique_id')

        # Vérifier que le message est pour la bonne boutique
        if str(boutique_id) != self.boutique_id:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Message envoyé à la mauvaise boutique',
                'code': 4000
            }))
            return

        # Envoyer le message au groupe
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': str(self.user.id),
                'sender_name': f"{self.user.prenom} {self.user.nom}",
                'customer_id': customer_id,
                'boutique_id': boutique_id,
                'time': datetime.now().isoformat()
            }
        )

    async def handle_get_customers(self, data):
        try:
            # Récupérer les clients de la boutique
            customers = await database_sync_to_async(list)(
                User.objects.filter(
                    role='client',
                    chat_messages__boutique_id=self.boutique_id
                ).distinct()
            )
            
            await self.send(text_data=json.dumps({
                'type': 'customers',
                'customers': [
                    {
                        'id': str(customer.id),
                        'name': f"{customer.prenom} {customer.nom}",
                        'isOnline': True  # À implémenter avec un système de présence
                    }
                    for customer in customers
                ]
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f"Erreur lors de la récupération des clients: {str(e)}",
                'code': 4000
            }))

    async def handle_get_members(self, data):
        try:
            # Récupérer les membres (marchands) de la boutique
            boutique = await database_sync_to_async(Boutique.objects.get)(id=self.boutique_id)
            marchand = await database_sync_to_async(lambda: boutique.marchand)()
            
            await self.send(text_data=json.dumps({
                'type': 'members',
                'members': [
                    {
                        'id': str(marchand.user.id),
                        'name': f"{marchand.user.prenom} {marchand.user.nom}",
                        'isOnline': True  # À implémenter avec un système de présence
                    }
                ]
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f"Erreur lors de la récupération des membres: {str(e)}",
                'code': 4000
            }))

    async def handle_get_notifications(self, data):
        try:
            # Récupérer les notifications de la boutique
            notifications = await database_sync_to_async(list)(
                Notification.objects.filter(
                    boutique_id=self.boutique_id,
                    user=self.user
                ).order_by('-created_at')[:10]
            )
            
            await self.send(text_data=json.dumps({
                'type': 'notifications',
                'notifications': [
                    {
                        'id': str(notification.id),
                        'message': notification.message,
                        'sender_name': notification.sender_name,
                        'time': notification.created_at.isoformat(),
                        'read': notification.read
                    }
                    for notification in notifications
                ]
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f"Erreur lors de la récupération des notifications: {str(e)}",
                'code': 4000
            }))

    async def chat_message(self, event):
        # Envoyer le message au WebSocket
        await self.send(text_data=json.dumps(event))

    async def customer_entered(self, event):
        await self.send(text_data=json.dumps({
            'type': 'customer_entered',
            'customer_id': event['customer_id'],
            'customer_name': event['customer_name']
        }))

    async def member_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'member_status',
            'user_id': event['user_id'],
            'name': event['name'],
            'isOnline': event['isOnline']
        }))

    async def message_edited(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_edited',
            'message_id': event['message_id'],
            'new_text': event['new_text']
        }))

    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id']
        }))

    async def message_pinned(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_pinned',
            'message_id': event['message_id']
        }))

    async def message_reaction(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_reaction',
            'message_id': event['message_id'],
            'emoji': event['emoji'],
            'sender_name': event['sender_name']
        }))

    async def message_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_read',
            'message_id': event['message_id']
        }))

    async def notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification_id': event['notification_id'],
            'message': event['message'],
            'sender_name': event['sender_name'],
            'time': event['time'],
            'read': event['read']
        }))

    async def notification_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification_read',
            'notification_id': event['notification_id']
        }))

    async def all_notifications_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'all_notifications_read'
        }))

    # Database Operations
    @database_sync_to_async
    def get_room(self, room_name, user):
        try:
            # Try to get existing ChatRoom
            return ChatRoom.objects.get(name=room_name)
        except ChatRoom.DoesNotExist:
            room_type = 'admin' if room_name.startswith('admin_') else 'shop'
            boutique = None
            if room_type == 'shop':
                # Extract ID from room_name (e.g., shop_29 -> 29 or shop_41 -> user ID 41)
                try:
                    room_id = room_name.replace('shop_', '')
                    try:
                        # First, try to treat room_id as boutique_id
                        boutique = Boutique.objects.get(id=room_id)
                    except Boutique.DoesNotExist:
                        # If no boutique with room_id, assume room_id is user_id and find user's boutique
                        boutique = Boutique.objects.get(marchand_id=room_id)
                    room, created = ChatRoom.objects.get_or_create(
                        name=f"shop_{boutique.id}",  # Use boutique.id (e.g., shop_29)
                        defaults={'room_type': room_type, 'boutique': boutique}
                    )
                    # Create alias room for original room_name if different
                    if room_name != f"shop_{boutique.id}":
                        alias_room, alias_created = ChatRoom.objects.get_or_create(
                            name=room_name,
                            defaults={'room_type': room_type, 'boutique': boutique}
                        )
                        if alias_created:
                            alias_room.members.add(user)
                    if created:
                        room.members.add(user)
                    return room
                except Boutique.DoesNotExist:
                    # Create a new Boutique if none exists for the user
                    boutique = Boutique.objects.create(
                        marchand=user,
                        nom=f"{user.name}'s Boutique",
                        description='Auto-created boutique',
                        adresse='',
                        telephone='',
                        email=user.email
                    )
                    room, created = ChatRoom.objects.get_or_create(
                        name=f"shop_{boutique.id}",
                        defaults={'room_type': room_type, 'boutique': boutique}
                    )
                    if created:
                        room.members.add(user)
                    # Create alias for original room_name
                    if room_name != f"shop_{boutique.id}":
                        alias_room, alias_created = ChatRoom.objects.get_or_create(
                            name=room_name,
                            defaults={'room_type': room_type, 'boutique': boutique}
                        )
                        if alias_created:
                            alias_room.members.add(user)
                    return room
            else:
                # Create admin room
                room, created = ChatRoom.objects.get_or_create(
                    name=room_name,
                    defaults={'room_type': room_type}
                )
                if created:
                    room.members.add(user)
                return room

    @database_sync_to_async
    def validate_access(self, user, room):
        logger.debug(f"Validating access for user {user.email} (role: {user.role}) in room {room.name} (type: {room.room_type})")
        if room.room_type == 'admin':
            if user.role.lower() != 'admin':
                return {'allowed': False, 'reason': 'User is not an Admin'}
            return {'allowed': True, 'reason': ''}
        if room.room_type == 'shop':
            user_role = user.role.lower()
            if user_role == 'marchand':
                if room.boutique.marchand != user:
                    return {'allowed': False, 'reason': f'User is not the marchand of boutique {room.boutique.id}'}
            elif user_role != 'client':
                return {'allowed': False, 'reason': f'Invalid role: {user.role}. Must be Marchand or Client'}
            return {'allowed': True, 'reason': ''}
        return {'allowed': False, 'reason': f'Unknown room type: {room.room_type}'}

    @database_sync_to_async
    def has_access(self, user, room):
        is_member = room.members.filter(id=user.id).exists()
        logger.debug(f"User {user.email} membership check for room {room.name}: {is_member}")
        if not is_member:
            # Auto-add user to room if they are the marchand or a client
            if room.room_type == 'shop' and (user == room.boutique.marchand or user.role.lower() == 'client'):
                room.members.add(user)
                is_member = True
                logger.info(f"Auto-added user {user.email} to room {room.name}")
        return is_member

    @database_sync_to_async
    def add_user_to_room(self, user):
        room = ChatRoom.objects.get(name=self.room_name)
        if user not in room.members.all():
            room.members.add(user)
            logger.info(f"Added user {user.email} to room {room.name}")

    @database_sync_to_async
    def save_message(self, room, user, message, customer_id, reply_to):
        customer = User.objects.get(id=customer_id) if customer_id else user
        msg = ChatMessage.objects.create(
            room=room,
            user=user,
            customer=customer,
            message=message,
            reply_to_id=reply_to
        )
        return msg.id

    @database_sync_to_async
    def get_room_members(self, room):
        if room.room_type == 'shop':
            return list(room.members.filter(role__iexact='Client').values('id', 'name', 'role', 'is_online'))
        return list(room.members.filter(role__iexact='Admin').values('id', 'name', 'role', 'is_online'))

    @database_sync_to_async
    def get_previous_messages(self, room):
        return list(ChatMessage.objects.filter(room=room).order_by('timestamp').values(
            'id', 'user__name', 'user__id', 'customer__id', 'message', 'timestamp',
            'is_edited', 'is_deleted', 'reply_to_id'
        ))

    @database_sync_to_async
    def get_previous_notifications(self, user):
        return list(Notification.objects.filter(user=user).values(
            'id', 'message', 'sender', 'timestamp', 'read'
        ))

    @database_sync_to_async
    def edit_message(self, message_id, new_text):
        message = ChatMessage.objects.get(id=message_id, user=self.scope['user'])
        message.message = new_text
        message.is_edited = True
        message.save()

    @database_sync_to_async
    def delete_message(self, message_id):
        message = ChatMessage.objects.get(id=message_id, user=self.scope['user'])
        message.is_deleted = True
        message.save()

    @database_sync_to_async
    def pin_message(self, message_id):
        message = ChatMessage.objects.get(id=message_id)
        PinnedMessage.objects.create(message=message, pinned_by=self.scope['user'])

    @database_sync_to_async
    def react_to_message(self, message_id, emoji):
        message = ChatMessage.objects.get(id=message_id)
        MessageReaction.objects.get_or_create(
            message=message, user=self.scope['user'], emoji=emoji
        )

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        try:
            message = ChatMessage.objects.get(id=message_id)
            MessageRead.objects.get_or_create(message=message, user=self.scope['user'])
            return message.id
        except ChatMessage.DoesNotExist:
            logger.warning(f"Message with ID {message_id} does not exist")
            return None

    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=self.scope['user'])
            notification.read = True
            notification.save()
        except Notification.DoesNotExist:
            logger.warning(f"Notification with ID {notification_id} does not exist")

    @database_sync_to_async
    def mark_all_notifications_as_read(self):
        Notification.objects.filter(user=self.scope['user']).update(read=True)

    # Notification Methods
    async def notify_customer_entered(self, user):
        marchand = await database_sync_to_async(lambda: self.room.boutique.marchand)()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'customer_entered',
                'customer_id': str(user.id),
                'customer_name': user.name
            }
        )
        notification = await database_sync_to_async(Notification.objects.create)(
            user=marchand,
            message=f"{user.name} has entered your boutique",
            sender=user.name,
            read=False
        )
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'notification',
                'notification_id': str(notification.id),
                'message': notification.message,
                'sender_name': notification.sender,
                'time': notification.timestamp.isoformat(),
                'read': notification.read
            }
        )

    async def save_and_send_notification(self, message, sender_name, message_id):
        members = await self.get_room_members(self.room)
        for member in members:
            if member['name'] != sender_name:
                user = await database_sync_to_async(User.objects.get)(id=member['id'])
                notification = await database_sync_to_async(Notification.objects.create)(
                    user=user,
                    message=f"New message from {sender_name}: {message[:50]}...",
                    sender=sender_name,
                    read=False
                )
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'notification',
                        'notification_id': str(notification.id),
                        'message': notification.message,
                        'sender_name': notification.sender,
                        'time': notification.timestamp.isoformat(),
                        'read': notification.read
                    }
                )

    async def send_previous_messages(self):
        messages = await self.get_previous_messages(self.room)
        for msg in messages:
            await self.send(text_data=json.dumps({
                'type': 'chat_message',
                'id': str(msg['id']),
                'message': msg['message'],
                'sender_name': msg['user__name'],
                'sender_id': str(msg['user__id']),
                'customer_id': str(msg['customer__id']) if msg['customer__id'] else None,
                'reply_to': msg.get('reply_to_id'),
                'time': msg['timestamp'].isoformat(),
                'is_edited': msg.get('is_edited', False),
                'is_deleted': msg.get('is_deleted', False)
            }))

    async def send_members(self):
        members = await self.get_room_members(self.room)
        await self.send(text_data=json.dumps({
            'type': 'customers' if self.room.room_type == 'shop' else 'members',
            'customers' if self.room.room_type == 'shop' else 'members': [
                {
                    'id': str(member['id']),
                    'name': member['name'],
                    'is_online': member['is_online']
                }
                for member in members
            ]
        }))

    async def send_notifications(self):
        notifications = await self.get_previous_notifications(self.scope['user'])
        for notification in notifications:
            await self.send(text_data=json.dumps({
                'type': 'notification',
                'notification_id': str(notification['id']),
                'message': notification['message'],
                'sender_name': notification['sender'],
                'time': notification['timestamp'].isoformat(),
                'read': notification['read']
            }))

    async def notify_member_status(self, is_online):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'member_status',
                'user_id': str(self.scope['user'].id),
                'name': self.scope['user'].name,
                'isOnline': is_online
            }
        )

    async def notify_message_edited(self, message_id, new_text):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'message_edited',
                'message_id': str(message_id),
                'new_text': new_text
            }
        )

    async def notify_message_deleted(self, message_id):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'message_deleted',
                'message_id': str(message_id)
            }
        )

    async def notify_message_pinned(self, message_id):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'message_pinned',
                'message_id': str(message_id)
            }
        )

    async def notify_message_reaction(self, message_id, emoji):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'message_reaction',
                'message_id': str(message_id),
                'emoji': emoji,
                'sender_name': self.scope['user'].name
            }
        )

    async def notify_message_read(self, message_id):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'message_read',
                'message_id': str(message_id)
            }
        )

    async def notify_notification_read(self, notification_id):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'notification_read',
                'notification_id': str(notification_id)
            }
        )

    async def notify_all_notifications_read(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'all_notifications_read'
            }
        )

    def get_current_time(self):
        return datetime.now()