import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Chip,
  Alert,
} from '@mui/material';
import axios from 'axios';

function Payments() {
  const [tabValue, setTabValue] = useState(0);
  const [payments, setPayments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập lại');
        return;
      }

      const response = await axios.get('/api/admin/payments.php');

      if (response.data.success) {
        setPayments(response.data.data.payments);
        setDebts(response.data.data.debts);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } else {
        setError('Có lỗi xảy ra khi tải dữ liệu');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã thanh toán':
        return 'success';
      case 'Chờ thanh toán':
        return 'warning';
      case 'Quá hạn':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý thanh toán
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Danh sách thanh toán" />
          <Tab label="Danh sách nợ" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã sinh viên</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell>Loại thanh toán</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.student_id}</TableCell>
                  <TableCell>{payment.fullname}</TableCell>
                  <TableCell>{payment.room_number}</TableCell>
                  <TableCell>{payment.payment_type}</TableCell>
                  <TableCell>{payment.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.payment_status}
                      color={getStatusColor(payment.payment_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(payment.created_at).toLocaleDateString('vi-VN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã sinh viên</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Phòng</TableCell>
                <TableCell>Nợ tiền phòng</TableCell>
                <TableCell>Nợ tiền điện</TableCell>
                <TableCell>Nợ tiền nước</TableCell>
                <TableCell>Tổng nợ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {debts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell>{debt.student_id}</TableCell>
                  <TableCell>{debt.fullname}</TableCell>
                  <TableCell>{debt.room_number}</TableCell>
                  <TableCell>{debt.room_debt.toLocaleString('vi-VN')} VNĐ</TableCell>
                  <TableCell>{debt.electricity_debt.toLocaleString('vi-VN')} VNĐ</TableCell>
                  <TableCell>{debt.water_debt.toLocaleString('vi-VN')} VNĐ</TableCell>
                  <TableCell>
                    {(debt.room_debt + debt.electricity_debt + debt.water_debt).toLocaleString('vi-VN')} VNĐ
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default Payments; 