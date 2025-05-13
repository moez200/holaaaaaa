import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users,
  Store,
  UserCheck,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';

type SidebarItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: <LayoutDashboard size={20} />
  },
  {
    name: 'Merchants',
    path: '/merchants',
    icon: <UserCheck size={20} />
  },
  {
    name: 'Stores',
    path: '/stores',
    icon: <Store size={20} />
  },
  {
    name: 'Customers',
    path: '/customers',
    icon: <Users size={20} />
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: <BarChart3 size={20} />
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: <Settings size={20} />
  }
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleMobileMenu}
            className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="ml-3 text-lg font-semibold">Admin Dashboard</span>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-40 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
        <div className="relative flex flex-col w-72 max-w-xs bg-gray-900 h-full overflow-y-auto">
          <div className="flex items-center justify-between px-4 h-16 bg-gray-800">
            <span className="text-xl font-bold text-white">Admin Dashboard</span>
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 mt-1 text-base font-medium rounded-md transition-colors
                  ${location.pathname === item.path
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-gray-900 overflow-y-auto">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-800">
            <span className="text-xl font-bold text-white">Admin Dashboard</span>
          </div>
          <div className="flex-1 flex flex-col mt-5">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
                    ${location.pathname === item.path
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                  `}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                  AD
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs font-medium text-gray-400">System Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;