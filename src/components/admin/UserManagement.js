import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';

function UserManagement() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    student_id: '',
    fullname: '',
    phone: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xem thông tin.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'http://localhost:80/project3/api/admin/users.php',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUserData(response.data.data);
      } else {
        setError(response.data.message || 'Lỗi khi tải dữ liệu người dùng.');
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu người dùng:', err);
      setError('Không thể kết nối đến máy chủ hoặc bạn không có quyền truy cập.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      student_id: user.student_id,
      fullname: user.fullname,
      phone: user.phone,
    });
    setEditDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:80/project3/api/admin/users.php',
        {
          user_id: selectedUser.id,
          ...editForm,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setEditDialog(false);
        fetchUserData(); // Refresh data after successful edit
      } else {
        setError(response.data.message || 'Lỗi khi cập nhật thông tin người dùng.');
      }
    } catch (err) {
      console.error('Lỗi cập nhật thông tin:', err);
      setError('Không thể cập nhật thông tin người dùng.');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Đang tải dữ liệu người dùng...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý Người Dùng
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Tổng quan</Typography>
            <Typography variant="body1">Tổng số người dùng: <strong>{userData?.total_users || 0}</strong></Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Danh sách người dùng</Typography>
            {userData?.users && userData.users.length > 0 ? (
              <List>
                {userData.users.map((user) => (
                  <Box key={user.id} mb={2}>
                    <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', p: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="span" fontWeight="bold">
                            {`${user.fullname} (${user.student_id})`}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {`Email: ${user.email}`}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              {`Số điện thoại: ${user.phone}`}
                            </Typography>
                          </>
                        }
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditClick(user)}
                        sx={{ mt: 1 }}
                      >
                        Chỉnh sửa
                      </Button>
                    </ListItem>
                    <Divider component="li" sx={{ mt: 1 }} />
                  </Box>
                ))}
              </List>
            ) : (
              <Typography>Không có người dùng nào được tìm thấy.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Mã sinh viên"
              value={editForm.student_id}
              onChange={(e) => setEditForm({ ...editForm, student_id: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Họ và tên"
              value={editForm.fullname}
              onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Hủy</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default UserManagement; 