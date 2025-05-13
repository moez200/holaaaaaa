import React, { useState } from 'react';
import { Search, Filter, Plus, Trash2, Edit, Eye, Clock, Send, Bell } from 'lucide-react';

const Content: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'banners' | 'notifications'>('banners');

  const banners = [
    { 
      id: 1, 
      title: 'Summer Sale', 
      description: '50% off on selected items', 
      location: 'Homepage Hero', 
      status: 'active', 
      startDate: '01 Jun 2023', 
      endDate: '30 Jun 2023',
      thumbnail: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    { 
      id: 2, 
      title: 'New Collection', 
      description: 'Check out our latest arrivals', 
      location: 'Category Page', 
      status: 'scheduled', 
      startDate: '15 Jul 2023', 
      endDate: '15 Aug 2023',
      thumbnail: 'https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    { 
      id: 3, 
      title: 'Flash Deals', 
      description: '24 hour special offers', 
      location: 'Homepage Sidebar', 
      status: 'ended', 
      startDate: '10 May 2023', 
      endDate: '11 May 2023',
      thumbnail: 'https://images.pexels.com/photos/5650026/pexels-photo-5650026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    { 
      id: 4, 
      title: 'Back to School', 
      description: 'Prepare for the new academic year', 
      location: 'Homepage Hero', 
      status: 'draft', 
      startDate: '01 Aug 2023', 
      endDate: '31 Aug 2023',
      thumbnail: 'https://images.pexels.com/photos/5699516/pexels-photo-5699516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
  ];

  const notifications = [
    { 
      id: 1, 
      title: 'App Update Available', 
      content: 'Version 2.0 is now available with new features', 
      sentTo: 'All Users', 
      status: 'sent', 
      sentDate: '05 Jun 2023', 
      readRate: '76%',
      type: 'system'
    },
    { 
      id: 2, 
      title: 'Order Discounts', 
      content: 'Use code SUMMER15 for 15% off your next order', 
      sentTo: 'Premium Users', 
      status: 'sent', 
      sentDate: '10 Jun 2023', 
      readRate: '82%',
      type: 'promotion'
    },
    { 
      id: 3, 
      title: 'Welcome New Users', 
      content: 'Get started with your new account', 
      sentTo: 'New Users', 
      status: 'scheduled', 
      sentDate: '15 Jun 2023', 
      readRate: '-',
      type: 'onboarding'
    },
    { 
      id: 4, 
      title: 'Payment Method Update', 
      content: 'We\'ve updated our payment processing system', 
      sentTo: 'All Users', 
      status: 'draft', 
      sentDate: '-', 
      readRate: '-',
      type: 'system'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-purple-100 text-purple-800';
      case 'promotion':
        return 'bg-red-100 text-red-800';
      case 'onboarding':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Content & Notifications</h2>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          <Plus size={16} className="mr-2" />
          {activeTab === 'banners' ? 'Add New Banner' : 'Create Notification'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              activeTab === 'banners'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            Banners
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              activeTab === 'notifications'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bell size={18} className="mr-2" />
            Notifications
          </button>
        </div>

        {/* Search and filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
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

        {/* Content */}
        {activeTab === 'banners' ? (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {banners.map((banner) => (
                <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-40 bg-gray-200 relative">
                    <img 
                      src={banner.thumbnail} 
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(banner.status)}`}>
                        {banner.status.charAt(0).toUpperCase() + banner.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{banner.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{banner.description}</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>
                        <span className="block text-gray-400">Location</span>
                        <span>{banner.location}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400">Duration</span>
                        <span>{banner.startDate} - {banner.endDate}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-2">
                      <button className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" title="Preview">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Send Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Read Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{notification.content}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notification.sentTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.status)}`}>
                        {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {notification.status !== 'draft' && <Clock size={14} className="mr-1 text-gray-400" />}
                        {notification.sentDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notification.readRate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end items-center space-x-2">
                        {notification.status === 'draft' || notification.status === 'scheduled' ? (
                          <button className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200" title="Send Now">
                            <Send size={16} />
                          </button>
                        ) : (
                          <button className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" title="View Stats">
                            <Eye size={16} />
                          </button>
                        )}
                        <button className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;