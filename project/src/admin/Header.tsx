
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
  boutiqueName: string;
  toggleNotificationPanel: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, boutiqueName }) => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      sx={{ bgcolor: 'white', color: 'black', boxShadow: 1 }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {boutiqueName}
        </Typography>
        <IconButton
          color="inherit"
          onClick={() => navigate('/gigs')}
        >
          <ArrowBack />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;