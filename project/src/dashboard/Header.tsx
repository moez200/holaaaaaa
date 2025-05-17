import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import api from '../axiosInstance';
import { useAuthStore } from '../components/Store/authStore';

type Notification = {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
};

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('cart/notifications/');
        setNotifications(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
      }
    };

    fetchNotifications();
    // Polling toutes les 30 secondes pour les nouvelles notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((notif) => !notif.is_read).length;

  const toggleUserMenu = () => {
    setShowProfile(!showProfile);
  };

  const handleProfileClick = () => {
    setShowProfile(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setShowProfile(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="text-gray-600 focus:outline-none md:mr-6"
          >
            <Menu size={24} />
          </button>

          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Rechercher..."
              className="py-2 pl-10 pr-4 w-72 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-5">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-30 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-center text-sm text-gray-500">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${notif.is_read ? 'bg-gray-50' : ''}`}
                      >
                        <p className="text-sm text-gray-800">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 text-center border-t border-gray-200">
                  <button className="text-sm text-green-600 hover:text-green-800">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="focus:outline-none"
              aria-label="User menu"
            >
              {user && user.avatar ? (
                <img
                  src={
                    user.avatar
                      ? `http://localhost:8000${user.avatar}`
                      : '/default-avatar.png'
                  }
                  alt={user.nom || 'Utilisateur'}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-green-500"
                />
              ) : (
                <User className="h-6 w-6 text-green-600 hover:text-green-800 transition-colors" />
              )}
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-30 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || 'Non connecté'}</p>
                </div>
                <button 
                  onClick={handleProfileClick} 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profil
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Paramètres
                </button>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;