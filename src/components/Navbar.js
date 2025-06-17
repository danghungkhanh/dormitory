import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function Navbar({ isLoggedIn, isAdmin, setIsLoggedIn, setIsAdmin }) {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElForms, setAnchorElForms] = useState(null);
  const [anchorElAdmin, setAnchorElAdmin] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenFormsMenu = (event) => {
    setAnchorElForms(event.currentTarget);
  };

  const handleCloseFormsMenu = () => {
    setAnchorElForms(null);
  };

  const handleOpenAdminMenu = (event) => {
    setAnchorElAdmin(event.currentTarget);
  };

  const handleCloseAdminMenu = () => {
    setAnchorElAdmin(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
    handleCloseUserMenu();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
            mr: 4,
          }}
        >
          HUMG
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ my: 2, color: 'white', mr: 3 }}
            startIcon={<HomeIcon />}
          >
            Trang chủ
          </Button>

          {!isAdmin && (
            <>
              <Button
                color="inherit"
                sx={{ my: 2, color: 'white', mr: 2 }}
                startIcon={<ListAltIcon />}
                endIcon={<ExpandMoreIcon />}
                onClick={handleOpenFormsMenu}
              >
                Biểu mẫu
              </Button>
              <Menu
                id="menu-forms"
                anchorEl={anchorElForms}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElForms)}
                onClose={handleCloseFormsMenu}
              >
                <MenuItem onClick={() => { navigate('/dorm-register'); handleCloseFormsMenu(); }}>Đăng ký nội trú KTX</MenuItem>
                <MenuItem onClick={() => { navigate('/payment-room'); handleCloseFormsMenu(); }}>Thanh toán tiền phòng</MenuItem>
                <MenuItem onClick={() => { navigate('/payment-electricity'); handleCloseFormsMenu(); }}>Thanh toán tiền điện</MenuItem>
                <MenuItem onClick={() => { navigate('/payment-water'); handleCloseFormsMenu(); }}>Thanh toán tiền nước</MenuItem>
                <MenuItem onClick={() => { navigate('/payment-others'); handleCloseFormsMenu(); }}>Thanh toán chi phí khác</MenuItem>
              </Menu>
            </>
          )}
        </Box>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          {isAdmin && (
            <>
              <Button
                color="inherit"
                sx={{ my: 2, color: 'white', mr: 2 }}
                startIcon={<SettingsIcon />}
                endIcon={<ExpandMoreIcon />}
                onClick={handleOpenAdminMenu}
              >
                Quản trị
              </Button>
              <Menu
                id="menu-admin"
                anchorEl={anchorElAdmin}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElAdmin)}
                onClose={handleCloseAdminMenu}
              >
                <MenuItem onClick={() => { navigate('/admin/users'); handleCloseAdminMenu(); }}>Quản lý người dùng</MenuItem>
                <MenuItem onClick={() => { navigate('/admin/rooms'); handleCloseAdminMenu(); }}>Quản lý phòng</MenuItem>
                <MenuItem onClick={() => { navigate('/admin/payments'); handleCloseAdminMenu(); }}>Quản lý thanh toán</MenuItem>
                <MenuItem onClick={() => { navigate('/admin/utility-readings'); handleCloseAdminMenu(); }}>Quản lý số liệu điện nước</MenuItem>
              </Menu>
            </>
          )}

          {isLoggedIn ? (
            <Box sx={{ flexGrow: 0 }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenUserMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 0 }}>
              <Button color="inherit" component={RouterLink} to="/login" sx={{ mr: 2 }}>
                Đăng nhập
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Đăng ký
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 