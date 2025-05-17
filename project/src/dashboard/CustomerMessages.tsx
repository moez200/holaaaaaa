import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, Search, Edit2, Trash2, Pin, Heart } from 'lucide-react';
import { useAuthStore } from '../components/Store/authStore';

interface ChatMessage {
  id: string;
  customerId: string;
  customerName: string;
  senderId: string;
  content: string;
  date: string;
  isFromMerchant: boolean;
  hasEarlyPaymentReward?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  replyTo?: string | null;
  reactions?: { emoji: string; name: string }[];
}

interface Member {
  id: string;
  name: string;
  isOnline: boolean;
}

interface Notification {
  id: string;
  message: string;
  senderName: string;
  time: string;
  read: boolean;
}

interface User {
  id: string;
  role: 'client' | 'marchand' | 'admin';
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  created_at: string;
  updated_at: string;
  has_boutique: boolean;
  is_active: boolean;
  is_approved: boolean;
  is_staff: boolean;
}

const roleMap: Record<User['role'], 'customer' | 'merchant' | 'admin'> = {
  client: 'customer',
  marchand: 'merchant',
  admin: 'admin',
};

const computeRoomDetails = (
  userId: string | undefined,
  userRole: User['role'] | undefined,
  boutiqueId: string | null
): { roomName: string; roomType: 'shop' | 'admin'; error: string | null } => {
  if (!userId || !userRole) {
    return { roomName: '', roomType: 'shop', error: 'Utilisateur non authentifié' };
  }

  const serverRole = roleMap[userRole];
  let roomName = '';
  let roomType: 'shop' | 'admin' = 'shop';

  if (serverRole === 'merchant') {
    if (!boutiqueId) {
      return { roomName: '', roomType: 'shop', error: 'ID de boutique manquant pour le marchand' };
    }
    roomName = `shop_${boutiqueId}`;
  } else if (serverRole === 'admin') {
    roomType = 'admin';
    roomName = `admin_${userId}`;
  } else if (serverRole === 'customer') {
    if (!boutiqueId) {
      return { roomName: '', roomType: 'shop', error: 'ID de boutique manquant pour le client' };
    }
    roomName = `shop_${boutiqueId}`;
  } else {
    return { roomName: '', roomType: 'shop', error: 'Rôle utilisateur invalide' };
  }

  return { roomName, roomType, error: null };
};

const CustomerMessages: React.FC = () => {
  // State management with optimized selectors
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const userRole = useAuthStore((state) => state.user?.role ?? undefined);

  const { boutiqueId: paramBoutiqueId } = useParams<{ boutiqueId: string }>();
  const [roomName, setRoomName] = useState<string>('');
  const [roomType, setRoomType] = useState<'shop' | 'admin'>('shop');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const messageQueue = useRef<string[]>([]); // Queue for pending messages

  // Memoize boutiqueId to prevent unnecessary recalculations
  const boutiqueId = useMemo(() => paramBoutiqueId || null, [paramBoutiqueId]);

  // Stable room details calculation
  const { roomName: computedRoomName, roomType: computedRoomType, error: computedError } = useMemo(() => {
    return computeRoomDetails(userId, userRole, boutiqueId);
  }, [userId, userRole, boutiqueId]);

  // Update room state only when computed values change
  useEffect(() => {
    setRoomName((prev) => (prev !== computedRoomName ? computedRoomName : prev));
    setRoomType((prev) => (prev !== computedRoomType ? computedRoomType : prev));
    setError((prev) => (prev !== computedError ? computedError : prev));
  }, [computedRoomName, computedRoomType, computedError]);

  // Function to send or queue messages
  const sendOrQueueMessage = useCallback((message: object) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      messageQueue.current.push(JSON.stringify(message));
    }
  }, []);

  // Function to flush message queue
  const flushMessageQueue = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      while (messageQueue.current.length > 0) {
        ws.current.send(messageQueue.current.shift()!);
      }
    }
  }, []);

  // WebSocket connection management
  useEffect(() => {
    if (!computedRoomName || !accessToken || computedError) {
      return;
    }

    const connectWebSocket = () => {
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError('Échec de la connexion après plusieurs tentatives');
        setIsConnecting(false);
        return;
      }

      setIsConnecting(true);
      const wsUrl = `ws://localhost:8000/ws/chat/${computedRoomName}/?token=${accessToken}&role=${userRole}&boutique_id=${boutiqueId || ''}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        reconnectAttempts.current = 0;
        setError(null);
        setIsConnecting(false);

        // Send initial messages via queue
        sendOrQueueMessage({
          type: 'connect',
          role: userRole,
          boutique_id: boutiqueId,
          user_id: userId,
        });

        sendOrQueueMessage({
          type: roomType === 'shop' ? 'get_customers' : 'get_members',
          boutique_id: boutiqueId,
        });

        sendOrQueueMessage({
          type: 'get_notifications',
          boutique_id: boutiqueId,
        });

        flushMessageQueue();
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'error':
            setError(data.message || 'Erreur WebSocket inconnue');
            if (data.code === 4003) {
              ws.current?.close(4003, 'Accès non autorisé');
            }
            break;
          case 'chat_message':
            if (data.boutique_id === boutiqueId) {
              setMessages((prev) => [
                ...prev,
                {
                  id: data.id,
                  customerId: data.customer_id || selectedCustomer || 'unknown',
                  customerName: data.sender_name || 'Inconnu',
                  senderId: data.sender_id,
                  content: data.message,
                  date: data.time,
                  isFromMerchant: userRole?.toLowerCase() === 'marchand' && data.sender_id === userId,
                  hasEarlyPaymentReward: data.message.includes('EARLY10'),
                  isEdited: data.is_edited || false,
                  isDeleted: data.is_deleted || false,
                  replyTo: data.reply_to || null,
                },
              ]);
            }
            break;
          case 'customers':
          case 'members':
            setMembers(data.customers || data.members || []);
            break;
          case 'customer_entered':
            setNotifications((prev) => [
              ...prev,
              {
                id: `enter-${data.customer_id}-${Date.now()}`,
                message: `${data.customer_name} a rejoint votre boutique`,
                senderName: data.customer_name,
                time: new Date().toISOString(),
                read: false,
              },
            ]);
            setMembers((prev) => {
              if (prev.some((m) => m.id === data.customer_id)) return prev;
              return [...prev, { id: data.customer_id, name: data.customer_name, isOnline: true }];
            });
            break;
          case 'member_status':
            setMembers((prev) =>
              prev.map((m) => (m.id === data.user_id ? { ...m, isOnline: data.isOnline } : m))
            );
            break;
          case 'notification':
            setNotifications((prev) => [
              ...prev,
              {
                id: data.notification_id,
                message: data.message,
                senderName: data.sender_name,
                time: data.time,
                read: data.read,
              },
            ]);
            break;
          case 'message_edited':
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.message_id ? { ...msg, content: data.new_text, isEdited: true } : msg
              )
            );
            break;
          case 'message_deleted':
            setMessages((prev) =>
              prev.map((msg) => (msg.id === data.message_id ? { ...msg, isDeleted: true } : msg))
            );
            break;
          case 'message_pinned':
          case 'message_read':
          case 'notification_read':
          case 'all_notifications_read':
            break;
          default:
            console.warn(`Unhandled message type: ${data.type}`);
            break;
        }
      };

      ws.current.onclose = (event) => {
        setIsConnecting(false);
        if (event.code === 4003) {
          setError('Accès non autorisé à la salle de chat');
          return;
        }
        if (event.code !== 1000) {
          setError(`Connexion interrompue: ${event.reason || 'Raison inconnue'}`);
          reconnectAttempts.current += 1;
          reconnectTimeout.current = setTimeout(connectWebSocket, 5000);
        }
      };

      ws.current.onerror = () => {
        setIsConnecting(false);
        setError('Erreur de connexion WebSocket');
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close(1000, 'Component unmount');
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      messageQueue.current = [];
      setIsConnecting(false);
    };
  }, [computedRoomName, accessToken, userRole, boutiqueId, computedError, roomType, userId, selectedCustomer, sendOrQueueMessage, flushMessageQueue]);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws.current) return;

    sendOrQueueMessage({
      type: 'chat_message',
      message: newMessage,
      customer_id: roomType === 'shop' ? selectedCustomer : undefined,
      boutique_id: boutiqueId,
      reply_to: null,
    });
    setNewMessage('');
  }, [newMessage, roomType, selectedCustomer, boutiqueId, sendOrQueueMessage]);

  const handleOfferReward = useCallback((customerId: string) => {
    if (!ws.current || roomType !== 'shop') return;

    sendOrQueueMessage({
      type: 'chat_message',
      message: 'Pour vous remercier de votre paiement rapide, nous vous offrons une remise de 10% sur votre prochaine commande ! Code promo : EARLY10',
      customer_id: customerId,
      boutique_id: boutiqueId,
      reply_to: null,
    });
  }, [roomType, boutiqueId, sendOrQueueMessage]);

  const handleEditMessage = useCallback((messageId: string, newText: string) => {
    if (!ws.current || !newText) return;
    sendOrQueueMessage({
      type: 'edit_message',
      message_id: messageId,
      new_text: newText,
    });
  }, [sendOrQueueMessage]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    if (!ws.current) return;
    sendOrQueueMessage({
      type: 'delete_message',
      message_id: messageId,
    });
  }, [sendOrQueueMessage]);

  const handlePinMessage = useCallback((messageId: string) => {
    if (!ws.current) return;
    sendOrQueueMessage({
      type: 'pin_message',
      message_id: messageId,
    });
  }, [sendOrQueueMessage]);

  const handleReactToMessage = useCallback((messageId: string, emoji: string) => {
    if (!ws.current) return;
    sendOrQueueMessage({
      type: 'react_to_message',
      message_id: messageId,
      emoji,
    });
  }, [sendOrQueueMessage]);

  const handleMarkNotificationAsRead = useCallback((notificationId: string) => {
    if (!ws.current) return;
    sendOrQueueMessage({
      type: 'mark_notification_as_read',
      notification_id: notificationId,
    });
  }, [sendOrQueueMessage]);

  const handleMarkAllNotificationsAsRead = useCallback(() => {
    if (!ws.current) return;
    sendOrQueueMessage({ type: 'mark_all_notifications_as_read' });
  }, [sendOrQueueMessage]);

  const handleCustomerSelect = useCallback((customerId: string) => {
    setSelectedCustomer(roomType === 'shop' ? customerId : null);
  }, [roomType]);

  // Memoized derived data
  const customerMessages = useMemo(() => {
    return roomType === 'shop' && selectedCustomer
      ? messages.filter((msg) => msg.customerId === selectedCustomer)
      : messages;
  }, [messages, roomType, selectedCustomer]);

  const filteredMembers = useMemo(() => {
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        member.id.includes(searchQuery)
    );
  }, [members, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {roomType === 'shop' ? 'Messages Clients' : 'Messages Admins'}
        </h1>
        <p className="text-gray-500">
          {roomType === 'shop' ? 'Gérez vos conversations avec les clients' : 'Discussions administratives'}
        </p>
        {error && <p className="text-red-500">{error}</p>}
        {isConnecting && <p className="text-blue-500">Connexion en cours...</p>}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Members/Customers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder={roomType === 'shop' ? 'Rechercher un client...' : 'Rechercher un admin...'}
                className="w-full py-2 pl-10 pr-4 border rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto divide-y">
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleCustomerSelect(member.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 ${
                  selectedCustomer === member.id && roomType === 'shop' ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.isOnline ? 'En ligne' : 'Hors ligne'}</p>
                  </div>
                  {notifications.some((n) => n.senderName === member.name && !n.read) && (
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow md:col-span-2">
          {(roomType === 'shop' && selectedCustomer) || roomType === 'admin' ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {roomType === 'shop'
                        ? members.find((m) => m.id === selectedCustomer)?.name ?? 'Client inconnu'
                        : 'Discussion Admin'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {roomType === 'shop' && members.find((m) => m.id === selectedCustomer)?.isOnline
                        ? 'En ligne'
                        : 'Hors ligne'}
                    </p>
                  </div>
                  {roomType === 'shop' && selectedCustomer && (
                    <button
                      onClick={() => handleOfferReward(selectedCustomer)}
                      className="px-4 py-2 text-sm text-yellow-800 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      Offrir une remise
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {customerMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isFromMerchant ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`relative max-w-xs px-4 py-2 rounded-lg md:max-w-md ${
                        msg.isFromMerchant ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                      } ${msg.hasEarlyPaymentReward ? 'border-2 border-yellow-400' : ''} ${
                        msg.isDeleted ? 'opacity-50' : ''
                      }`}
                    >
                      {msg.isDeleted ? (
                        <p className="text-sm italic">Message supprimé</p>
                      ) : (
                        <>
                          <p className="text-sm">{msg.content}</p>
                          {msg.isEdited && <p className="text-xs italic">Modifié</p>}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex mt-1 space-x-2">
                              {msg.reactions.map((r, idx) => (
                                <span key={idx} className="text-xs">
                                  {r.emoji}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      <p
                        className={`text-xs mt-1 ${msg.isFromMerchant ? 'text-blue-200' : 'text-gray-500'}`}
                      >
                        {new Date(msg.date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {!msg.isDeleted && msg.isFromMerchant && (
                        <div className="absolute top-0 right-0 flex p-1 space-x-2">
                          <button
                            onClick={() =>
                              handleEditMessage(msg.id, prompt('Nouveau texte:', msg.content) || msg.content)
                            }
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => handlePinMessage(msg.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Pin size={16} />
                          </button>
                          <button
                            onClick={() => handleReactToMessage(msg.id, '❤️')}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Heart size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-4" />
                <p>
                  {roomType === 'shop'
                    ? 'Sélectionnez un client pour voir la conversation'
                    : 'Aucune conversation sélectionnée'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Notifications</h2>
            <button
              onClick={handleMarkAllNotificationsAsRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Tout marquer comme lu
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className={`p-2 rounded-lg ${n.read ? 'bg-gray-100' : 'bg-blue-50'}`}>
                <p className="text-sm">
                  <strong>{n.senderName}</strong>: {n.message}
                </p>
                <p className="text-xs text-gray-500">{new Date(n.time).toLocaleString('fr-FR')}</p>
                {!n.read && (
                  <button
                    onClick={() => handleMarkNotificationAsRead(n.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Marquer comme lu
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CustomerMessages);