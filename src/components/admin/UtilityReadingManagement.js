import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  InputLabel,
  Select,
  FormControl,
  Grid
} from '@mui/material';

export default function UtilityReadingManagement() {
  const [readings, setReadings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    electricity_kwh: '',
    water_m3: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Fetch users instead of rooms
      const usersResponse = await axios.get('http://localhost/project3/api/admin/users.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersResponse.data.success) {
        // Truy cập mảng users từ cấu trúc dữ liệu lồng nhau
        const usersData = Array.isArray(usersResponse.data.data.users) ? usersResponse.data.data.users : [];
        setUsers(usersData);
      } else {
        setError(usersResponse.data.message);
        setUsers([]); // Set empty array if there's an error
      }

      // Fetch utility readings
      const readingsResponse = await axios.get('http://localhost/project3/api/admin/utility_readings.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (readingsResponse.data.success) {
        setReadings(readingsResponse.data.data);
      } else {
        setError(readingsResponse.data.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Bạn không có quyền truy cập chức năng này. Vui lòng đăng nhập với tài khoản quản trị.');
      } else if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError('Lỗi khi tải dữ liệu. Vui lòng thử lại.');
        console.error('Error fetching data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('http://localhost/project3/api/admin/utility_readings.php', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setFormData({
          student_id: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          electricity_kwh: '',
          water_m3: '',
        });
        fetchData(); // Refresh list
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Bạn không có quyền thêm dữ liệu sử dụng điện nước.');
      } else if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError('Lỗi khi thêm dữ liệu. Vui lòng thử lại.');
        console.error('Error adding utility reading:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Quản lý số liệu điện nước
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Thêm/Cập nhật số liệu
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Sinh viên</InputLabel>
                <Select
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  label="Sinh viên"
                  required
                >
                  {Array.isArray(users) && users.map(userItem => (
                    <MenuItem key={userItem.id} value={userItem.student_id}>
                      {userItem.fullname} ({userItem.student_id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Tháng</InputLabel>
                <Select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  label="Tháng"
                  required
                >
                  {months.map(m => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Năm</InputLabel>
                <Select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  label="Năm"
                  required
                >
                  {years.map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Số kWh điện"
                name="electricity_kwh"
                type="number"
                value={formData.electricity_kwh}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Số m³ nước"
                name="water_m3"
                type="number"
                value={formData.water_m3}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Thêm/Cập nhật số liệu'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Danh sách số liệu điện nước
        </Typography>
        {loading ? (
          <Typography>Đang tải danh sách...</Typography>
        ) : readings.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã số sinh viên</TableCell>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell>Phòng</TableCell>
                  <TableCell>Tháng</TableCell>
                  <TableCell>Năm</TableCell>
                  <TableCell>Số kWh điện</TableCell>
                  <TableCell>Số m³ nước</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {readings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell>{reading.student_id}</TableCell>
                    <TableCell>{reading.fullname}</TableCell>
                    <TableCell>{reading.room_number}</TableCell>
                    <TableCell>{reading.month}</TableCell>
                    <TableCell>{reading.year}</TableCell>
                    <TableCell>{reading.electricity_kwh}</TableCell>
                    <TableCell>{reading.water_m3}</TableCell>
                    <TableCell>{new Date(reading.recorded_at).toLocaleDateString('vi-VN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>Chưa có số liệu điện nước nào.</Typography>
        )}
      </Paper>
    </Container>
  );
} 