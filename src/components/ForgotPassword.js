import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';

function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');

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
    setNewPassword('');

    try {
      const response = await axios.post(
        'http://localhost:80/project3/api/forgot_password.php',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setSuccess('Mật khẩu mới đã được tạo thành công.');
        setNewPassword(response.data.data.new_password);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi tạo mật khẩu mới.');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      setError('Có lỗi xảy ra khi kết nối với máy chủ.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Quên mật khẩu
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {newPassword && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Mật khẩu mới của bạn là: <strong>{newPassword}</strong>
            <br />
            Vui lòng đăng nhập lại với mật khẩu mới này.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Mã số sinh viên"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
          >
            Lấy mật khẩu mới
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
            sx={{ mt: 1 }}
          >
            Quay lại đăng nhập
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ForgotPassword; 