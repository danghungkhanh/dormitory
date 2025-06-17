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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';

function RoomManagement() {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vui lòng đăng nhập để xem thông tin.');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          'http://localhost:80/project3/api/admin/rooms.php',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setRoomData(response.data.data);
        } else {
          setError(response.data.message || 'Lỗi khi tải dữ liệu phòng.');
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu phòng:', err);
        setError('Không thể kết nối đến máy chủ hoặc bạn không có quyền truy cập.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, []);

  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setViewDialog(true);
  };

  const handleCloseDialog = () => {
    setViewDialog(false);
    setSelectedRoom(null);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Đang tải dữ liệu phòng...</Typography>
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
        Quản lý Phòng Ký Túc Xá
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Tổng quan</Typography>
            <Typography variant="body1">Tổng số phòng: <strong>{roomData.total_rooms}</strong></Typography>
            <Typography variant="body1">Tổng số sinh viên: <strong>{roomData.total_students}</strong></Typography>
            <Typography variant="body1">Phòng còn trống: <strong>{roomData.available_rooms}</strong></Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Chi tiết từng phòng</Typography>
            {roomData.rooms.length > 0 ? (
              <List>
                {roomData.rooms.map((room) => (
                  <Box key={room.room_id} mb={2}>
                    <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', p: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" component="span" fontWeight="bold">
                              {`Phòng: ${room.room_number} (${room.dorm_name} - ${room.room_type_name})`}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {`Sức chứa: ${room.capacity} | Hiện tại: ${room.current_occupancy} | Trạng thái: ${room.status}`}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                {`Giá: ${parseFloat(room.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}/tháng`}
                              </Typography>
                            </>
                          }
                        />
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewRoom(room)}
                          size="small"
                        >
                          Xem phòng
                        </Button>
                      </Box>
                    </ListItem>
                    <Divider component="li" sx={{ mt: 1 }} />
                  </Box>
                ))}
              </List>
            ) : (
              <Typography>Không có phòng nào được tìm thấy.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog hiển thị chi tiết phòng */}
      <Dialog
        open={viewDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chi tiết phòng {selectedRoom?.room_number}
        </DialogTitle>
        <DialogContent>
          {selectedRoom && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Thông tin phòng</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Ký túc xá:</strong> {selectedRoom.dorm_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Loại phòng:</strong> {selectedRoom.room_type_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Sức chứa:</strong> {selectedRoom.capacity} người
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>Hiện tại:</strong> {selectedRoom.current_occupancy} người
                  </Typography>
                  <Typography variant="body1">
                    <strong>Trạng thái:</strong> {selectedRoom.status}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Giá phòng:</strong> {parseFloat(selectedRoom.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}/tháng
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Danh sách sinh viên</Typography>
              {selectedRoom.occupants && selectedRoom.occupants.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã sinh viên</TableCell>
                        <TableCell>Họ và tên</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Số điện thoại</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedRoom.occupants.map((occupant, index) => (
                        <TableRow key={index}>
                          <TableCell>{occupant.student_id}</TableCell>
                          <TableCell>{occupant.fullname}</TableCell>
                          <TableCell>{occupant.email}</TableCell>
                          <TableCell>{occupant.phone}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  Phòng chưa có sinh viên nào
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default RoomManagement; 