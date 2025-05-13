import React, { useState } from 'react';
import { Search, Filter, MessageSquare, CheckCircle, AlertCircle, Clock, RefreshCw, CheckSquare, X } from 'lucide-react';

const Support: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<number | null>(2);
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'closed'>('all');
  
  const tickets = [
    { 
      id: 1, 
      subject: 'Payment not processing',
      customer: 'Emma Wilson',
      email: 'emma@example.com',
      status: 'open',
      priority: 'high',
      category: 'payment',
      created: '2 hours ago',
      lastUpdate: '30 min ago',
      messages: [
        { 
          id: 1, 
          sender: 'customer', 
          name: 'Emma Wilson',
          message: "I'm trying to complete my purchase but the payment keeps failing. I've tried multiple cards but none work. Can you help?", 
          time: '2 hours ago' 
        }
      ]
    },
    { 
      id: 2, 
      subject: 'Login issues after password reset',
      customer: 'James Smith',
      email: 'james@example.com',
      status: 'open',
      priority: 'medium',
      category: 'account',
      created: '5 hours ago',
      lastUpdate: '1 hour ago',
      messages: [
        { 
          id: 1, 
          sender: 'customer', 
          name: 'James Smith',
          message: "After resetting my password, I'm unable to log in. It says my credentials are invalid but I'm sure I'm using the correct new password.", 
          time: '5 hours ago' 
        },
        { 
          id: 2, 
          sender: 'admin', 
          name: 'Support Team',
          message: "Hi James, I'm sorry to hear about your login trouble. Could you try clearing your browser cache and cookies, then attempt to log in again? Sometimes stored data can interfere with the login process after a password change.", 
          time: '3 hours ago' 
        },
        { 
          id: 3, 
          sender: 'customer', 
          name: 'James Smith',
          message: "I tried clearing my cache and cookies as suggested, but I'm still having the same issue. Is there anything else I can try?", 
          time: '1 hour ago' 
        }
      ]
    },
    { 
      id: 3, 
      subject: 'Missing item in my order',
      customer: 'Olivia Davis',
      email: 'olivia@example.com',
      status: 'open',
      priority: 'medium',
      category: 'orders',
      created: '1 day ago',
      lastUpdate: '6 hours ago',
      messages: [
        { 
          id: 1, 
          sender: 'customer', 
          name: 'Olivia Davis',
          message: "I received my order #ORD-5321 today but one item is missing. I ordered 3 items but only received 2. Can you help me locate the missing item?", 
          time: '1 day ago' 
        }
      ]
    },
    { 
      id: 4, 
      subject: 'How to change shipping address',
      customer: 'Benjamin Taylor',
      email: 'benjamin@example.com',
      status: 'closed',
      priority: 'low',
      category: 'shipping',
      created: '2 days ago',
      lastUpdate: '1 day ago',
      messages: [
        { 
          id: 1, 
          sender: 'customer', 
          name: 'Benjamin Taylor',
          message: "I need to change the shipping address for my recent order. Is that possible if the order hasn't shipped yet?", 
          time: '2 days ago' 
        }
      ]
    },
    { 
      id: 5, 
      subject: 'Refund status inquiry',
      customer: 'Sophia Anderson',
      email: 'sophia@example.com',
      status: 'closed',
      priority: 'medium',
      category: 'refunds',
      created: '3 days ago',
      lastUpdate: '2 days ago',
      messages: [
        { 
          id: 1, 
          sender: 'customer', 
          name: 'Sophia Anderson',
          message: "I returned an item last week and was approved for a refund, but I haven't received the money back yet. When can I expect the refund to be processed?", 
          time: '3 days ago' 
        }
      ]
    }
  ];

  const filteredTickets = ticketFilter === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status === ticketFilter);

  const currentTicket = tickets.find(ticket => ticket.id === selectedTicket) || null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
      case 'account':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
      case 'orders':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;
      case 'shipping':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>;
      case 'refunds':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
      default:
        return <MessageSquare size={16} />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Support Tickets</h2>
        <div className="flex space-x-3">
          <div className="inline-flex rounded-md shadow-sm">
            <button 
              onClick={() => setTicketFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                ticketFilter === 'all' 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-300' 
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setTicketFilter('open')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                ticketFilter === 'open' 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-300' 
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Open
            </button>
            <button 
              onClick={() => setTicketFilter('closed')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                ticketFilter === 'closed' 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-300' 
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Closed
            </button>
          </div>

          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center hover:bg-gray-50">
              <Filter size={16} className="mr-2 text-gray-500" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ticket dashboard with list and detail view */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        {/* Ticket list */}
        <div className={`w-full md:w-96 border-r border-gray-200 ${selectedTicket ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Tickets ({filteredTickets.length})</h3>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket === ticket.id ? 'bg-indigo-50' : ''}`}
                onClick={() => setSelectedTicket(ticket.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`text-sm font-medium ${selectedTicket === ticket.id ? 'text-indigo-600' : 'text-gray-900'}`}>
                    {ticket.subject}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {ticket.customer} • {ticket.created}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      <span className="mr-1">{getCategoryIcon(ticket.category)}</span>
                      {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {ticket.messages.length} {ticket.messages.length === 1 ? 'message' : 'messages'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket detail */}
        {selectedTicket ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <button 
                  className="md:hidden inline-flex items-center mr-3 text-gray-500"
                  onClick={() => setSelectedTicket(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <h3 className="text-lg font-medium text-gray-900">{currentTicket?.subject}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="mr-2">Ticket #{currentTicket?.id}</span>
                  <span className="mr-2">•</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(currentTicket?.priority || 'medium')}`}>
                    {currentTicket?.priority.charAt(0).toUpperCase() + currentTicket?.priority.slice(1)}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="inline-flex items-center text-xs">
                    <Clock size={14} className="mr-1" />
                    {currentTicket?.created}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 rounded-lg hover:bg-gray-200">
                  {currentTicket?.status === 'open' ? (
                    <CheckCircle size={20} className="text-green-600" />
                  ) : (
                    <AlertCircle size={20} className="text-red-600" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {currentTicket?.messages.map((message, index) => (
                <div key={index} className={`mb-6 flex ${message.sender === 'admin' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-3xl rounded-lg p-4 ${message.sender === 'admin' ? 'bg-indigo-50 text-gray-800' : 'bg-white text-gray-800 border border-gray-200'}`}>
                    <div className="flex items-center mb-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${message.sender === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                        {message.name.charAt(0)}
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium">
                          {message.name}
                          {message.sender === 'admin' && <span className="ml-1 text-xs font-normal text-gray-500">(Support Team)</span>}
                        </div>
                        <div className="text-xs text-gray-500">{message.time}</div>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-line">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex">
                <textarea
                  rows={3}
                  placeholder="Type your reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="mt-3 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                    </svg>
                    Attach
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Template
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Send Reply
                  </button>
                  {currentTicket?.status === 'open' ? (
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <CheckSquare size={16} className="mr-2" />
                      Close Ticket
                    </button>
                  ) : (
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <RefreshCw size={16} className="mr-2" />
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ticket selected</h3>
              <p className="text-gray-500 max-w-sm">Select a ticket from the list to view details and respond to customer inquiries.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;