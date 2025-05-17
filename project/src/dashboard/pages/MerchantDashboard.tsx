import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Alert, Container, IconButton } from '@mui/material';
import { Support, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { Users } from 'lucide-react';

import { Boutique } from '../../types';
import AccountSettings from '../AccountSettings';
import CustomerMessages from '../CustomerMessages';
import Header from '../Header';
import Notifications from '../Notifications';
import OrderManagement from '../OrderManagement';
import Overview from '../Overview';
import PaymentManagement from '../PaymentManagement';
import ProductManagement from '../ProductManagement';
import StoreManagement from '../StoreManagement';
import Sidebar from '../Sidebar';

import { 
  getBoutiqueDetails, 
  getDashboardOverview, 
  getMonthlySales, 
  getOutOfStockProducts, 
  getProductsByCategory, 
  getTopSellingProducts 
} from '../../services/boutiqueService';
import RemiseTypeManagement from '../RemiseTypeManagement.';

type ActiveSection = 'overview' | 'products' | 'store' | 'orders' | 'payments' | 'notifications' | 'support' | 'settings' | 'messages' | 'user' | 'remise';

const MerchantDashboard: React.FC = () => {
  const { boutiqueId } = useParams<{ boutiqueId: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [error, setError] = useState<string>('');
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    monthlySales: [],
    productsByCategory: [],
    topSellingProducts: [],
    outOfStockProducts: 0,
  });
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch boutique details and dashboard data
  useEffect(() => {
    const fetchBoutiqueData = async () => {
      if (!boutiqueId) {
        setError('No boutique ID provided.');
        return;
      }
      try {
        const boutiqueData = await getBoutiqueDetails(boutiqueId);
        setBoutique(boutiqueData);

        const [overview, monthlySales, productsByCategory, topSellingProducts, outOfStockProducts] = await Promise.all([
          getDashboardOverview(boutiqueId),
          getMonthlySales(boutiqueId),
          getProductsByCategory(boutiqueId),
          getTopSellingProducts(boutiqueId),
          getOutOfStockProducts(boutiqueId)
        ]);

        setDashboardData({
          overview,
          monthlySales,
          productsByCategory,
          topSellingProducts,
          outOfStockProducts
        });
      } catch (err) {
        setError('Failed to fetch data.');
        console.error('Fetch error:', err);
      }
    };
    fetchBoutiqueData();
  }, [boutiqueId]);

  // Check if scrolling is needed
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (sidebarRef.current && contentRef.current) {
        const needsScroll = sidebarRef.current.scrollHeight > contentRef.current.clientHeight;
        setShowScrollButtons(needsScroll);
      }
    };

    checkScrollNeeded();
    window.addEventListener('resize', checkScrollNeeded);
    return () => window.removeEventListener('resize', checkScrollNeeded);
  }, []);

  const handleScroll = useCallback((direction: 'up' | 'down') => {
    if (!sidebarRef.current || !contentRef.current) return;

    const scrollStep = 100;
    const currentScroll = sidebarRef.current.scrollTop;
    const maxScroll = sidebarRef.current.scrollHeight - contentRef.current.clientHeight;

    let newScroll = direction === 'up' 
      ? Math.max(0, currentScroll - scrollStep)
      : Math.min(maxScroll, currentScroll + scrollStep);

    sidebarRef.current.scrollTo({
      top: newScroll,
      behavior: 'smooth'
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSetActiveSection = useCallback((section: ActiveSection) => {
    setActiveSection(section);
  }, []);

  const renderActiveSection = useCallback(() => {
    if (!boutiqueId) return null;
    switch (activeSection) {
      case 'overview':
        return <Overview dashboardData={dashboardData} />;
      case 'products':
        return <ProductManagement boutiqueId={boutiqueId} />;
      case 'store':
        return <StoreManagement boutiqueId={boutiqueId} />;
      case 'remise':
        return <RemiseTypeManagement boutiqueId={boutiqueId} />;
      case 'orders':
        return <OrderManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'notifications':
        return <Notifications />;
      case 'support':
        return <div>Support Section</div>;
      case 'settings':
        return <AccountSettings />;
      case 'messages':
        return <CustomerMessages />;
      case 'user':
        return <div>User Management</div>;
      default:
        return <Overview dashboardData={dashboardData} />;
    }
  }, [activeSection, boutiqueId, dashboardData]);

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <Box
        ref={sidebarRef}
        sx={{
          width: isSidebarOpen ? 240 : 64,
          height: '100%',
          flexShrink: 0,
          transition: 'width 0.3s ease',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          position: 'relative'
        }}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          activeSection={activeSection}
          setActiveSection={handleSetActiveSection}
          onToggle={toggleSidebar}
        />

        {/* Scroll buttons */}
        {showScrollButtons && isSidebarOpen && (
          <Box sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <IconButton
              onClick={() => handleScroll('up')}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:disabled': { opacity: 0.3 }
              }}
              disabled={sidebarRef.current?.scrollTop === 0}
            >
              <KeyboardArrowUp />
            </IconButton>
            <IconButton
              onClick={() => handleScroll('down')}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:disabled': { opacity: 0.3 }
              }}
              disabled={
                sidebarRef.current && 
                contentRef.current &&
                sidebarRef.current.scrollTop >= 
                sidebarRef.current.scrollHeight - contentRef.current.clientHeight - 1
              }
            >
              <KeyboardArrowDown />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Main content */}
      <Box 
        ref={contentRef}
        sx={{ 
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: `calc(100% - ${isSidebarOpen ? 240 : 64}px)`
        }}
      >
        <Header
          toggleSidebar={toggleSidebar}
          boutiqueName={boutique?.nom || 'Merchant Dashboard'}
        />
        
        
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: { xs: 2, md: 4 }
          }}
        >
          {renderActiveSection()}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(MerchantDashboard);