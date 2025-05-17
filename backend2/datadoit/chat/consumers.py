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
        try:
            query_string = self.scope['query_string'].decode()
            params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
            self.role = params.get('role')
            boutique_id = params.get('boutique_id')
            if not self.role or not boutique_id:
                raise ValueError("Missing role or boutique_id")
            self.boutique_id = str(boutique_id)
        except (ValueError, IndexError) as e:
            logger.error(f"Invalid query string: {str(e)}")
            await self.close(code=4003, reason="Missing or invalid role/boutique_id")
            return

        logger.debug(f"Connecting user: {self.user}, Role: {self.role}, Boutique ID: {self.boutique_id}, Room: {self.room_name}")

        if not await self.validate_access():
            logger.error("Access validation failed")
            await self.close(code=4003, reason="Access validation failed")
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def validate_access(self):
        try:
            if self.role not in ['marchand', 'client']:
                logger.warning(f"Invalid role: {self.role}")
                return False
            return await self._validate_access_db()
        except Exception as e:
            logger.error(f"Erreur de validation d'accès: {str(e)}")
            return False

    @database_sync_to_async
    def _validate_access_db(self):
        try:
            boutique = Boutique.objects.get(id=self.boutique_id)
            if self.role == 'marchand':
                return boutique.marchand.user == self.user
            return True
        except Boutique.DoesNotExist:
            logger.error(f"Boutique with id {self.boutique_id} does not exist")
            return False

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        except Exception as e:
            logger.error(f"Error during disconnect: {str(e)}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON data: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON data',
                'code': 4000
            }))
            return

        message_type = data.get('type')
        if message_type == 'connect':
            await self.handle_connect(data)
        elif message_type == 'chat_message':
            await self.handle_chat_message(data)
        elif message_type == 'get_customers':
            await self.handle_get_customers(data)
        elif message_type == 'get_members':
            await self.handle_get_members(data)
        elif message_type == 'get_notifications':
            await self.handle_get_notifications(data)
        else:
            logger.warning(f"Unknown message type: {message_type}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f"Unknown message type: {message_type}",
                'code': 4000
            }))

    async def handle_connect(self, data):
        try:
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connexion établie avec succès'
            }))
        except Exception as e:
            logger.error(f"Error handling connect: {str(e)}")

    async def handle_chat_message(self, data):
        message = data.get('message')
        customer_id = data.get('customer_id')
        boutique_id = data.get('boutique_id')

        if not message or not boutique_id:
            logger.error("Missing message or boutique_id in chat message")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Missing message or boutique_id',
                'code': 4000
            }))
            return

        if str(boutique_id) != self.boutique_id:
            logger.error(f"Message sent to wrong boutique: {boutique_id}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Message envoyé à la mauvaise boutique',
                'code': 4000
            }))
            return

        try:
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
        except Exception as e:
            logger.error(f"Error sending chat message: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f"Error sending message: {str(e)}",
                'code': 4000
            }))

    async def handle_get_customers(self, data):
        try:
            try:
                boutique_id = int(self.boutique_id)
            except (ValueError, TypeError):
                logger.error(f"Invalid boutique_id: {self.boutique_id}")
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Invalid boutique_id',
                    'code': 4000
                }))
                return

            customers = await database_sync_to_async(list)(
                User.objects.filter(
                    role='client',
                    chat_messages__room__boutique__id=boutique_id
                ).distinct()
            )
            await self.send(text_data=json.dumps({
                'type': 'customers',
                'customers': [
                    {
                        'id': str(customer.id),
                        'name': f"{customer.prenom} {customer.nom}",
                        'isOnline': True
                    }
                    for customer in customers
                ]
            }))
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des clients: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f"Erreur lors de la récupération des clients: {str(e)}",
                'code': 4000
            }))

    async def handle_get_members(self, data):
        try:
            boutique = await database_sync_to_async(Boutique.objects.get)(id=self.boutique_id)
            marchand = await database_sync_to_async(lambda: boutique.marchand)()
            await self.send(text_data=json.dumps({
                'type': 'members',
                'members': [
                    {
                        'id': str(marchand.user.id),
                        'name': f"{marchand.user.prenom} {marchand.user.nom}",
                        'isOnline': True
                    }
                ]
            }))
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des membres: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f"Erreur lors de la récupération des membres: {str(e)}",
                'code': 4000
            }))

    async def handle_get_notifications(self, data):
        try:
            notifications = await database_sync_to_async(list)(
                Notification.objects.filter(
                    user=self.user
                ).order_by('-timestamp')[:10]
            )
            await self.send(text_data=json.dumps({
                'type': 'notifications',
                'notifications': [
                    {
                        'id': str(notification.id),
                        'message': notification.message,
                        'sender_name': notification.sender,
                        'time': notification.timestamp.isoformat(),
                        'read': notification.read
                    }
                    for notification in notifications
                ]
            }))
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des notifications: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f"Erreur lors de la récupération des notifications: {str(e)}",
                'code': 4000
            }))

    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps(event))
        except Exception as e:
            logger.error(f"Error sending chat message event: {str(e)}")

    async def customer_entered(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'customer_entered',
                'customer_id': event['customer_id'],
                'customer_name': event['customer_name']
            }))
        except Exception as e:
            logger.error(f"Error sending customer_entered event: {str(e)}")

    async def member_status(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'member_status',
                'user_id': event['user_id'],
                'name': event['name'],
                'isOnline': event['isOnline']
            }))
        except Exception as e:
            logger.error(f"Error sending member_status event: {str(e)}")

    async def message_edited(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'message_edited',
                'message_id': event['message_id'],
                'new_text': event['new_text']
            }))
        except Exception as e:
            logger.error(f"Error sending message_edited event: {str(e)}")

    async def message_deleted(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'message_deleted',
                'message_id': event['message_id']
            }))
        except Exception as e:
            logger.error(f"Error sending message_deleted event: {str(e)}")

    async def message_pinned(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'message_pinned',
                'message_id': event['message_id']
            }))
        except Exception as e:
            logger.error(f"Error sending message_pinned event: {str(e)}")

    async def message_reaction(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'message_reaction',
                'message_id': event['message_id'],
                'emoji': event['emoji'],
                'sender_name': event['sender_name']
            }))
        except Exception as e:
            logger.error(f"Error sending message_reaction event: {str(e)}")

    async def message_read(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'message_read',
                'message_id': event['message_id']
            }))
        except Exception as e:
            logger.error(f"Error sending message_read event: {str(e)}")

    async def notification(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'notification',
                'notification_id': event['notification_id'],
                'message': event['message'],
                'sender_name': event['sender_name'],
                'time': event['time'],
                'read': event['read']
            }))
        except Exception as e:
            logger.error(f"Error sending notification event: {str(e)}")

    async def notification_read(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'notification_read',
                'notification_id': event['notification_id']
            }))
        except Exception as e:
            logger.error(f"Error sending notification_read event: {str(e)}")

    async def all_notifications_read(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'all_notifications_read'
            }))
        except Exception as e:
            logger.error(f"Error sending all_notifications_read event: {str(e)}")

    @database_sync_to_async
    def get_room(self, room_name, user):
        try:
            return ChatRoom.objects.get(name=room_name)
        except ChatRoom.DoesNotExist:
            room_type = 'admin' if room_name.startswith('admin_') else 'shop'
            boutique = None
            if room_type == 'shop':
                try:
                    room_id = room_name.replace('shop_', '')
                    try:
                        boutique = Boutique.objects.get(id=room_id)
                    except Boutique.DoesNotExist:
                        boutique = Boutique.objects.get(marchand_id=room_id)
                    room, created = ChatRoom.objects.get_or_create(
                        name=f"shop_{boutique.id}",
                        defaults={'room_type': room_type, 'boutique': boutique}
                    )
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
                    boutique = Boutique.objects.create(
                        marchand=user,
                        nom=f"{user.nom}'s Boutique",
                        description='Auto-created boutique',
                        adresse='',
                        telephone='',
                      
                        email=user.email
                    )
                    room, created = ChatRoom.objects.get_or_create(
                        name=f"shop_{boutique.id}",
                        defaults={'room_type': room_type, 'boutique': boutique}
                    )
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
            else:
                room, created = ChatRoom.objects.get_or_create(
                    name=room_name,
                    defaults={'room_type': room_type}
                )
                if created:
                    room.members.add(user)
                return room

    @database_sync_to_async
    def check_room_access(self, user, room):
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
            if room.room_type == 'shop' and (user == room.boutique.marchand or user.role.lower() == 'client'):
                room.members.add(user)
                is_member = True
                logger.info(f"Auto-added user {user.email} to room {room.name}")
        return is_member

    @database_sync_to_async
    def add_user_to_room(self, user):
        try:
            room = ChatRoom.objects.get(name=self.room_name)
            if user not in room.members.all():
                room.members.add(user)
                logger.info(f"Added user {user.email} to room {room.name}")
        except Exception as e:
            logger.error(f"Error adding user to room: {str(e)}")

    @database_sync_to_async
    def save_message(self, room, user, message, customer_id, reply_to):
        try:
            customer = User.objects.get(id=customer_id) if customer_id else user
            msg = ChatMessage.objects.create(
                room=room,
                user=user,
                customer=customer,
                message=message,
                reply_to_id=reply_to
            )
            return msg.id
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            return None

    @database_sync_to_async
    def get_room_members(self, room):
        try:
            if room.room_type == 'shop':
                return list(room.members.filter(role__iexact='Client').values('id', 'name', 'role', 'is_online'))
            return list(room.members.filter(role__iexact='Admin').values('id', 'name', 'role', 'is_online'))
        except Exception as e:
            logger.error(f"Error getting room members: {str(e)}")
            return []

    @database_sync_to_async
    def get_previous_messages(self, room):
        try:
            return list(ChatMessage.objects.filter(room=room).order_by('timestamp').values(
                'id', 'user__name', 'user__id', 'customer__id', 'message', 'timestamp',
                'is_edited', 'is_deleted', 'reply_to_id'
            ))
        except Exception as e:
            logger.error(f"Error getting previous messages: {str(e)}")
            return []

    @database_sync_to_async
    def get_previous_notifications(self, user):
        try:
            return list(Notification.objects.filter(user=user).values(
                'id', 'message', 'sender', 'timestamp', 'read'
            ))
        except Exception as e:
            logger.error(f"Error getting previous notifications: {str(e)}")
            return []

    @database_sync_to_async
    def edit_message(self, message_id, new_text):
        try:
            message = ChatMessage.objects.get(id=message_id, user=self.scope['user'])
            message.message = new_text
            message.is_edited = True
            message.save()
        except Exception as e:
            logger.error(f"Error editing message: {str(e)}")

    @database_sync_to_async
    def delete_message(self, message_id):
        try:
            message = ChatMessage.objects.get(id=message_id, user=self.scope['user'])
            message.is_deleted = True
            message.save()
        except Exception as e:
            logger.error(f"Error deleting message: {str(e)}")

    @database_sync_to_async
    def pin_message(self, message_id):
        try:
            message = ChatMessage.objects.get(id=message_id)
            PinnedMessage.objects.create(message=message, pinned_by=self.scope['user'])
        except Exception as e:
            logger.error(f"Error pinning message: {str(e)}")

    @database_sync_to_async
    def react_to_message(self, message_id, emoji):
        try:
            message = ChatMessage.objects.get(id=message_id)
            MessageReaction.objects.get_or_create(
                message=message, user=self.scope['user'], emoji=emoji
            )
        except Exception as e:
            logger.error(f"Error reacting to message: {str(e)}")

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        try:
            message = ChatMessage.objects.get(id=message_id)
            MessageRead.objects.get_or_create(message=message, user=self.scope['user'])
            return message.id
        except Exception as e:
            logger.error(f"Error marking message as read: {str(e)}")
            return None

    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=self.scope['user'])
            notification.read = True
            notification.save()
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")

    @database_sync_to_async
    def mark_all_notifications_as_read(self):
        try:
            Notification.objects.filter(user=self.scope['user']).update(read=True)
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {str(e)}")

    async def notify_customer_entered(self, user):
        try:
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
        except Exception as e:
            logger.error(f"Erreur lors de la notification d'entrée du client: {str(e)}")

    async def save_and_send_notification(self, message, sender_name, message_id):
        try:
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
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi de la notification: {str(e)}")

    async def send_previous_messages(self):
        try:
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
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi des messages précédents: {str(e)}")

    async def send_members(self):
        try:
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
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi des membres: {str(e)}")

    async def send_notifications(self):
        try:
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
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi des notifications: {str(e)}")

    async def notify_member_status(self, is_online):
        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'member_status',
                    'user_id': str(self.scope['user'].id),
                    'name': self.scope['user'].name,
                    'isOnline': is_online
                }
            )
        except Exception as e:
            logger.error(f"Erreur lors de la notification du statut du membre: {str(e)}")

    async def notify_message_edited(self, message_id, new_text):
        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_edited',
                    'message_id': str(message_id),
                    'new_text': new_text
                }
            )
        except Exception as e:
            logger.error(f"Erreur lors de la notification de modification du message: {str(e)}")

    async def notify_message_deleted(self, message_id):
        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_deleted',
                    'message_id': str(message_id)
                }
            )
        except Exception as e:
            logger.error(f"Erreur lors de la notification de suppression du message: {str(e)}")

    async def notify_message_pinned(self, message_id):
        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_pinned',
                    'message_id': str(message_id)
                }
            )
        except Exception as e:
            logger.error(f"Erreur lors de la notification de message épinglé: {str(e)}")

    async def notify_message_reaction(self, message_id, emoji):
        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_reaction',
                    'message_id': str(message_id),
                    'emoji': emoji,
                    'sender_name': self.scope['user'].name
                }
            )
        except Exception as e:
            logger.error(f"Erreur lors de la notification de réaction au message: {str(e)}")

    async def notify_message_read(self, message_id):
        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_read',
                    'message_id': str(message_id)
                }
            )
        except Exception as e:
            logger.error(f"Erreur lors de la notification de message lu: {str(e)}")

    async def notify_notification_read(self, notification_id):
        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'notification_read',
                    'notification_id': str(notification_id)
                }
            )
        except Exception as e:
            logger.error(f"Erreur lors de la notification de lecture de notification: {str(e)}")

    async def notify_all_notifications_read(self):
        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'all_notifications_read'
                }
            )
        except Exception as e:
            logger.error(f"Erreur lors de la notification de toutes notifications lues: {str(e)}")

    def get_current_time(self):
        return datetime.now()