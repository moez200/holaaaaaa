import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Store, 
  ClipboardList, 
  CreditCard, 
  Bell, 
  MessageSquare,
  MessageCircle, 
  Settings, 
  Users,
  Percent
} from 'lucide-react';

type ActiveSection = 'overview' | 'products' | 'store' | 'orders' | 'payments' | 'notifications' | 'support' | 'settings' | 'messages' | 'remise' | 'users';

interface SidebarProps {
  isOpen: boolean;
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeSection, setActiveSection }) => {
  useEffect(() => {
    console.log('Sidebar re-rendered:', { isOpen, activeSection });
  });

  const handleSectionClick = (section: ActiveSection) => {
    console.log('Sidebar section clicked:', section);
    setActiveSection(section);
  };

  const navigationItems = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: <LayoutDashboard size={20} /> },
    { id: 'products', name: 'Produits', icon: <ShoppingBag size={20} /> },
    { id: 'store', name: 'Boutique', icon: <Store size={20} /> },
    { id: 'orders', name: 'Commandes', icon: <ClipboardList size={20} /> },
    { id: 'payments', name: 'Paiements', icon: <CreditCard size={20} /> },
    { id: 'remise', name: 'remise', icon: <Percent size={20} /> },
    { id: 'users', name: 'Utilisateurs', icon: <Users size={20} /> },
    { id: 'messages', name: 'Messages', icon: <MessageCircle size={20} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={20} /> },
    { id: 'support', name: 'Support', icon: <MessageSquare size={20} /> },
    { id: 'settings', name: 'Paramètres', icon: <Settings size={20} /> }
  ];

  return (
    <aside className={`bg-blue-800 text-white z-30 ${isOpen ? 'w-64' : 'w-0 md:w-16'} transition-all duration-300 ease-in-out fixed md:relative h-screen`}>
      <div className={`h-full flex flex-col ${!isOpen && 'md:items-center'}`}>
        <div className={`p-4 flex items-center ${!isOpen && 'md:justify-center'}`}>
          {isOpen ? (
            <div className="font-bold text-xl">Marchand</div>
          ) : (
            <div className="md:flex hidden md:h-12 md:w-12 md:rounded-full md:bg-blue-700 md:items-center md:justify-center">
              <Store size={20} />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.id} className="px-2 mb-1">
                <button
                  onClick={() => handleSectionClick(item.id as ActiveSection)}
                  className={`
                    flex items-center w-full ${isOpen ? 'px-4' : 'px-0 md:px-0 md:justify-center'} py-3 rounded-lg
                    ${activeSection === item.id ? 'bg-blue-700' : 'hover:bg-blue-700/50 transition-colors duration-200'}
                  `}
                >
                  <span className="text-white">{item.icon}</span>
                  {isOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4">
          {isOpen && (
            <div className="flex items-center space-x-3 bg-blue-700 p-3 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                M
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Mode Marchand</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;