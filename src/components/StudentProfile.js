import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Divider, Tabs, Tab, TextField, Button, Alert } from '@mui/material';
import axios from 'axios';

function StudentProfile() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const [tab, setTab] = useState(0);

  // State cho đổi mật khẩu
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:80/project3/api/change_password.php',
        {
          old_password: formData.oldPassword,
          new_password: formData.newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(response.data.message || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đổi mật khẩu');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Hồ sơ sinh viên
        </Typography>
        <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="Thông tin cá nhân" />
          <Tab label="Đổi mật khẩu" />
        </Tabs>
        {tab === 0 && (
          <Box>
            <Typography variant="subtitle1"><b>Họ tên:</b> {user.fullname}</Typography>
            <Typography variant="subtitle1"><b>Mã số sinh viên:</b> {user.student_id}</Typography>
            <Typography variant="subtitle1"><b>Email:</b> {user.email}</Typography>
            <Typography variant="subtitle1"><b>Số điện thoại:</b> {user.phone}</Typography>
            <Divider sx={{ my: 2 }} />
            {/* Có thể bổ sung chức năng chỉnh sửa thông tin ở đây nếu muốn */}
          </Box>
        )}
        {tab === 1 && (
          <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Mật khẩu cũ"
                name="oldPassword"
                type="password"
                value={formData.oldPassword}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Mật khẩu mới"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                Đổi mật khẩu
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default StudentProfile; 