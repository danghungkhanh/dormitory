import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DormRegister from './components/DormRegister';
import PaymentRoom from './components/PaymentRoom';
import PaymentElectricity from './components/PaymentElectricity';
import PaymentWater from './components/PaymentWater';
import AdminDashboard from './components/admin/AdminDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#005541',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      setIsAdmin(user && user.is_admin === 1);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dorm-register" element={<DormRegister />} />
        <Route path="/payment-room" element={<PaymentRoom />} />
        <Route path="/payment-electricity" element={<PaymentElectricity />} />
        <Route path="/payment-water" element={<PaymentWater />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App; 