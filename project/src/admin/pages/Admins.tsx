import React, { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, UserPlus, Shield, Eye, EyeOff } from 'lucide-react';

const Admins: React.FC = () => {
  const [showApiKeys, setShowApiKeys] = useState<Record<number, boolean>>({});
  
  const toggleApiKey = (id: number) => {
    setShowApiKeys({
      ...showApiKeys,
      [id]: !showApiKeys[id]
    });
  };

  const admins = [
    { 
      id: 1, 
      name: 'John Admin', 
      email: 'john@example.com', 
      role: 'Super Admin', 
      status: 'active', 
      lastLogin: '10 minutes ago',
      apiKey: 'sk_live_abcdefghijklmnopqrstuvwxyz123456',
      permissions: ['dashboard', 'users', 'merchants', 'stores', 'categories', 'content', 'support', 'settings', 'admins']
    },
    { 
      id: 2, 
      name: 'Sarah Manager', 
      email: 'sarah@example.com', 
      role: 'Content Manager', 
      status: 'active', 
      lastLogin: '2 hours ago',
      apiKey: 'sk_live_efghijklmnopqrstuvwxyz1234567890',
      permissions: ['dashboard', 'content', 'users', 'categories']
    },
    { 
      id: 3, 
      name: 'David Support', 
      email: 'david@example.com', 
      role: 'Support Agent', 
      status: 'active', 
      lastLogin: '1 day ago',
      apiKey: 'sk_live_hijklmnopqrstuvwxyz1234567890abc',
      permissions: ['dashboard', 'support', 'users']
    },
    { 
      id: 4, 
      name: 'Michael Analyst', 
      email: 'michael@example.com', 
      role: 'Data Analyst', 
      status: 'inactive', 
      lastLogin: '30 days ago',
      apiKey: 'sk_live_mnopqrstuvwxyz1234567890abcdefg',
      permissions: ['dashboard']
    },
    { 
      id: 5, 
      name: 'Emma Developer', 
      email: 'emma@example.com', 
      role: 'Developer', 
      status: 'active', 
      lastLogin: '3 hours ago',
      apiKey: 'sk_live_qrstuvwxyz1234567890abcdefghijk',
      permissions: ['dashboard', 'settings']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Content Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Support Agent':
        return 'bg-green-100 text-green-800';
      case 'Data Analyst':
        return 'bg-yellow-100 text-yellow-800';
      case 'Developer':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPermissionPills = (permissions: string[]) => {
    // Only show first 3 and a count for the rest
    const displayedPermissions = permissions.slice(0, 3);
    const remainingCount = permissions.length - 3;

    return (
      <div className="flex flex-wrap gap-1">
        {displayedPermissions.map((permission, index) => (
          <span 
            key={index} 
            className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
          >
            {permission}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Admin Management</h2>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          <UserPlus size={16} className="mr-2" />
          Add New Admin
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search admins..."
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

      {/* Admins Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                        {admin.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(admin.role)}`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {renderPermissionPills(admin.permissions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(admin.status)}`}>
                      {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-500 font-mono mr-2">
                        {showApiKeys[admin.id] 
                          ? admin.apiKey
                          : admin.apiKey.substring(0, 8) + '...' + admin.apiKey.substring(admin.apiKey.length - 4)
                        }
                      </div>
                      <button 
                        onClick={() => toggleApiKey(admin.id)}
                        className="p-1 text-gray-500 hover:text-indigo-600"
                      >
                        {showApiKeys[admin.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end items-center space-x-2">
                      <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-indigo-600">
                        <Shield size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-indigo-600">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <p className="text-sm text-gray-500">Showing 5 admins</p>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 bg-indigo-50 text-indigo-600 font-medium rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Role Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { 
              role: 'Super Admin',
              description: 'Full access to all functionalities and settings of the platform.',
              color: 'bg-purple-100 text-purple-800'
            },
            { 
              role: 'Content Manager',
              description: 'Can manage content, categories, and have limited access to user data.',
              color: 'bg-blue-100 text-blue-800'
            },
            { 
              role: 'Support Agent',
              description: 'Can handle support tickets and access basic user information.',
              color: 'bg-green-100 text-green-800'
            },
            { 
              role: 'Data Analyst',
              description: 'Read-only access to data and reports for analysis purposes.',
              color: 'bg-yellow-100 text-yellow-800'
            },
            { 
              role: 'Developer',
              description: 'Can access API settings and certain system configurations.',
              color: 'bg-indigo-100 text-indigo-800'
            }
          ].map((role, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 flex">
              <div className="mr-4">
                <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${role.color}`}>
                  <Shield size={16} />
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{role.role}</h4>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admins;