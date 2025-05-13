import React, { useState } from 'react';
import { Send, PaperclipIcon, UserCircle } from 'lucide-react';
import { Message, mockMessages, mockMerchant } from './data/mockData';


const Support: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [activeConversation, setActiveConversation] = useState<string>('admin');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: Date.now().toString(),
      conversationId: activeConversation,
      senderId: mockMerchant.id,
      senderName: mockMerchant.name,
      senderRole: 'merchant',
      receiverId: 'admin',
      receiverName: 'Support',
      content: newMessage,
      date: new Date().toISOString(),
      read: false
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  // Filter messages for active conversation
  const conversationMessages = messages.filter(
    (message) => message.conversationId === activeConversation
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Support</h1>
        <p className="text-gray-500">Contactez l'administrateur pour toute assistance</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-230px)]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
            <UserCircle size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Support Administrateur</h3>
            <p className="text-xs text-green-500">En ligne</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {conversationMessages.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Aucun message. Commencez la conversation!</p>
              </div>
            ) : (
              conversationMessages.map((message) => {
                const isSentByMe = message.senderId === mockMerchant.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                        isSentByMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          isSentByMe ? 'text-blue-200' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Input */}
        <div className="px-4 py-3 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 mr-2"
            >
              <PaperclipIcon size={20} />
            </button>
            <input
              type="text"
              placeholder="Tapez votre message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="ml-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;