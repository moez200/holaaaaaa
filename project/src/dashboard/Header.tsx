import React, { useState } from 'react';
import { Menu, Bell, Search, MessageSquare, User } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  merchantName: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, merchantName }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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
              className="py-2 pl-10 pr-4 w-72 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                3
              </span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-30 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <p className="text-sm text-gray-800">Nouvelle commande reçue - #{item}0345</p>
                      <p className="text-xs text-gray-500 mt-1">Il y a {item * 10} minutes</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 text-center border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="relative text-gray-600 hover:text-gray-900 focus:outline-none">
            <MessageSquare size={20} />
            <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500 text-white">
              2
            </span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
             
              </div>
            </button>
            
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-30 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium">{merchantName}</p>
                  <p className="text-xs text-gray-500">Marchand</p>
                </div>
                <ul>
                  <li>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mon profil
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Paramètres
                    </button>
                  </li>
                  <li className="border-t border-gray-200 mt-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      Déconnexion
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;