// ultimate-kl/components/Header.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/router';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faBolt, faFire, faMagnet, faRocket, faBrain } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

const icons = [
  faStar, faBolt, faFire, faMagnet, faRocket, faBrain,
];

const getRandomIcon = () => {
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
};

const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    setIcon(getRandomIcon());
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleChangePassword = () => {
    // Implemente a lógica para alterar a senha
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <AppBar position="fixed" color="secondary">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={handleGoHome}>
          <Image src="/logo.png" alt="Logo" width={60} height={60} />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user && user.login && (
            <Typography variant="body1" component="div" sx={{ marginRight: 2 }}>
              BEM VINDO {user.login.toUpperCase()}
            </Typography>
          )}
          <IconButton onClick={handleMenu} color="inherit">
            <Avatar sx={{ bgcolor: 'white', color: 'secondary.main' }}>
              {icon && <FontAwesomeIcon icon={icon} />}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleChangePassword}>Alterar Senha</MenuItem>
            <MenuItem onClick={handleLogout}>Sair</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
