
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Alert, Container } from '@mui/material';
import { Support } from '@mui/icons-material';

import { getBoutiques } from '../../services/productproduitservice';
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
import { Users } from 'lucide-react';
import RemiseTypeManagement from '../RemiseTypeManagement.';




type ActiveSection = 'overview' | 'products' | 'store' | 'orders' | 'payments' | 'notifications' | 'support' | 'settings' | 'messages' | 'user' | 'remise';

const MerchantDashboard: React.FC = () => {
  const { boutiqueId } = useParams<{ boutiqueId: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [error, setError] = useState<string>('');

  // Fetch boutique details
  useEffect(() => {
    const fetchBoutique = async () => {
      if (!boutiqueId) {
        setError('No boutique ID provided.');
        return;
      }
      try {
        const boutiques = await getBoutiques();
        const selectedBoutique = boutiques.find((b) => b.id.toString() === boutiqueId);
        if (!selectedBoutique) {
          setError('Boutique not found.');
          return;
        }
        setBoutique(selectedBoutique);
      } catch (err) {
        setError('Failed to fetch boutique details.');
        console.error('Fetch error:', err);
      }
    };
    fetchBoutique();
  }, [boutiqueId]);

  // Memoized callbacks
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
        return <Overview  />;
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
        return <Support />;
      case 'settings':
        return <AccountSettings merchant={undefined}  />;
      case 'messages':
        return <CustomerMessages />;
        case 'user':
          return <Users />;
      default:
        return <Overview/>;
    }
  }, [activeSection, boutiqueId, boutique]);

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Sidebar
        isOpen={isSidebarOpen}
        activeSection={activeSection}
        setActiveSection={handleSetActiveSection}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header
          toggleSidebar={toggleSidebar}
          boutiqueName={boutique?.nom || 'Merchant Dashboard'}
        />

        <Box component="main" sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 } }}>
          {renderActiveSection()}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(MerchantDashboard);