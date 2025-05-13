import React from 'react';
import { 
  BarChart3, 
  Users, 
  Store, 
  ShoppingBag, 
  Layers, 
  Bell, 
  LifeBuoy, 
  ShieldAlert, 
  Settings,
  X,
  Badge
} from 'lucide-react';

type Page = 'overview' | 'users' | 'merchants' | 'stores' | 'categories' | 'badges' | 'support' | 'admins' | 'settings';

interface SidebarProps {
  isOpen: boolean;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'merchants', label: 'Merchants', icon: <Store size={20} /> },
    { id: 'stores', label: 'Stores', icon: <ShoppingBag size={20} /> },
    { id: 'categories', label: 'Categories', icon: <Layers size={20} /> },
    { id: 'badges', label: 'badges', icon: <Badge size={20} /> },
    { id: 'support', label: 'Support', icon: <LifeBuoy size={20} /> },
    { id: 'admins', label: 'Admins', icon: <ShieldAlert size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => document.dispatchEvent(new CustomEvent('toggleSidebar'))}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full bg-indigo-900 text-white transition-all duration-300 ease-in-out
                   ${isOpen ? 'w-64' : 'w-0 -translate-x-full md:translate-x-0 md:w-16'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 ${!isOpen && 'md:justify-center'}`}>
            {isOpen && <h1 className="text-xl font-bold">AdminPanel</h1>}
            <button 
              className="p-1 rounded-full hover:bg-indigo-800 md:hidden"
              onClick={() => document.dispatchEvent(new CustomEvent('toggleSidebar'))}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as Page)}
                className={`flex items-center w-full px-3 py-2 text-left rounded-lg transition-colors duration-200 
                           ${currentPage === item.id 
                              ? 'bg-indigo-800 text-white' 
                              : 'text-indigo-100 hover:bg-indigo-800'
                            } ${!isOpen && 'md:justify-center'}`}
              >
                <span className="flex items-center justify-center">{item.icon}</span>
                {isOpen && <span className="ml-3">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className={`p-4 ${!isOpen && 'md:p-2'}`}>
            {isOpen ? (
              <div className="flex items-center p-2 bg-indigo-800 rounded-lg">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Users size={14} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-indigo-200">Super Admin</p>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex md:justify-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Users size={14} />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;