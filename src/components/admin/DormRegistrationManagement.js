import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

function DormRegistrationManagement() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:80/project3/api/admin/dorm_registrations.php',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setRegistrations(response.data.data);
      } else {
        setError(response.data.message || 'Lỗi khi lấy dữ liệu đăng ký.');
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError('Không thể kết nối đến máy chủ API.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (registration) => {
    setSelectedRegistration(registration);
    setNewStatus(registration.status);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRegistration(null);
    setNewStatus('');
    setError('');
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleSubmitStatusUpdate = async () => {
    setError('');
    if (!selectedRegistration || !newStatus) {
      setError('Thông tin cập nhật không hợp lệ.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:80/project3/api/admin/dorm_registrations.php',
        {
          id: selectedRegistration.id,
          status: newStatus,
          room_id: selectedRegistration.room_id // Truyền room_id để backend cập nhật current_occupancy
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        fetchRegistrations(); // Refresh data
        handleCloseDialog();
      } else {
        setError(response.data.message || 'Cập nhật trạng thái thất bại.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Có lỗi xảy ra khi cập nhật trạng thái.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'green';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      case 'cancelled': return 'gray';
      default: return 'black';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Quản lý đăng ký nội trú
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <Paper sx={{ p: 2, mt: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Đăng ký</TableCell>
                  <TableCell>Mã SV</TableCell>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell>Ký túc xá</TableCell>
                  <TableCell>Loại phòng</TableCell>
                  <TableCell>Phòng</TableCell>
                  <TableCell>Ngày nhận phòng</TableCell>
                  <TableCell>Thời gian ở (tháng)</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registrations.length > 0 ? (
                  registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>{reg.id}</TableCell>
                      <TableCell>{reg.student_id}</TableCell>
                      <TableCell>{reg.full_name}</TableCell>
                      <TableCell>{reg.dorm_name}</TableCell>
                      <TableCell>{reg.room_type_name}</TableCell>
                      <TableCell>{reg.room_number}</TableCell>
                      <TableCell>{reg.check_in_date}</TableCell>
                      <TableCell>{reg.duration}</TableCell>
                      <TableCell>
                        <span style={{ color: getStatusColor(reg.status), fontWeight: 'bold' }}>
                          {reg.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenDialog(reg)}
                        >
                          Cập nhật
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">Không có đơn đăng ký nào.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Cập nhật trạng thái đăng ký</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn đang cập nhật trạng thái cho đơn đăng ký của sinh viên <strong>{selectedRegistration?.full_name}</strong> (Mã SV: {selectedRegistration?.student_id}) ở phòng <strong>{selectedRegistration?.room_number}</strong>.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel id="new-status-label">Trạng thái mới</InputLabel>
            <Select
              labelId="new-status-label"
              id="new-status-select"
              value={newStatus}
              label="Trạng thái mới"
              onChange={handleStatusChange}
            >
              <MenuItem value="pending">Chờ duyệt</MenuItem>
              <MenuItem value="approved">Đã duyệt</MenuItem>
              <MenuItem value="rejected">Từ chối</MenuItem>
              <MenuItem value="cancelled">Đã hủy</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmitStatusUpdate} variant="contained" color="primary">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DormRegistrationManagement; 