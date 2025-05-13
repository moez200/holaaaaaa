

import React, { useState } from 'react';
import Overview from './pages/Overview';
import Users from './pages/Users';
import Merchants from './pages/Merchants';
import Stores from './pages/Stores';
import Categories from './pages/Categories';

import Support from './pages/Support';
import Admins from './pages/Admins';
import Settings from './pages/Settings';
import Header from './Header';
import Sidebar from './Sidebar';
import BadgeList from './pages/badges/BadgeList';
import CustomerOverview from './pages/badges/CustomerOverview';
import ReferralHistory from './pages/badges/ReferralHistory';
import ReferralList from './pages/badges/ReferralList';
import NotificationPanel from './pages/badges/NotificationPanel'; // Adjust path as needed
import { Tabs, TabsList, TabsTrigger, TabsContent } from './pages/badges/Tabs';


type Page = 'overview' | 'users' | 'merchants' | 'stores' | 'categories' | 'badges' | 'support' | 'admins' | 'settings';

const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'referrals' | 'customers'>('badges');
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotificationPanel = () => setIsNotificationPanelOpen((prev) => !prev);

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview />;
      case 'users':
        return <Users />;
      case 'merchants':
        return <Merchants />;
      case 'stores':
        return <Stores />;
      case 'categories':
        return <Categories />;
      case 'badges':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Loyalty Program Management
              </h1>
              <p className="text-gray-600 mt-1">
                Configure your customer loyalty program settings and monitor performance
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
              <TabsList>
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="referrals">Referrals & Discounts</TabsTrigger>
                <TabsTrigger value="customers">Customer Overview</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="badges">
                  <BadgeList />
                </TabsContent>
                <TabsContent value="referrals">
                  <div className="space-y-6">
                    <ReferralList />
                    <ReferralHistory />
                  </div>
                </TabsContent>
                <TabsContent value="customers">
                  <CustomerOverview />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        );
      case 'support':
        return <Support />;
      case 'admins':
        return <Admins />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Header
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          currentPage={currentPage}
          toggleNotificationPanel={toggleNotificationPanel} // Pass toggle function to Header
        />

        <main className="flex-1 overflow-auto p-4 md:p-6 relative">
          <div className="max-w-5xl mx-auto">
            {renderPage()}
          </div>
          {isNotificationPanelOpen && (
            <div className="fixed top-16 right-4 z-50">
              <NotificationPanel onClose={() => setIsNotificationPanelOpen(false)} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;