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
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

function RoomManagement() {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [tab, setTab] = useState(0);
  const [addForm, setAddForm] = useState({
    dorm_name: '',
    room_type_name: '',
    capacity: '',
    status: '',
    price: '',
    room_number: '',
    current_occupancy: '',
  });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [dorms, setDorms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [removeDialog, setRemoveDialog] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [removeError, setRemoveError] = useState('');

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

    // Fetch dorms cho dropdown
    axios.get('http://localhost:80/project3/api/dorms.php')
      .then(res => {
        if (res.data.success) setDorms(res.data.data);
      })
      .catch(() => {});

    // Fetch room types cho dropdown
    axios.get('http://localhost:80/project3/api/room_types.php')
      .then(res => {
        if (res.data.success) setRoomTypes(res.data.data);
      })
      .catch(() => {});
  }, []);

  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setViewDialog(true);
  };

  const handleCloseDialog = () => {
    setViewDialog(false);
    setSelectedRoom(null);
  };

  const handleTabChange = (e, v) => setTab(v);
  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };
  const handleAddRoom = async (e) => {
    e.preventDefault();
    setAddError(''); setAddSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:80/project3/api/admin/add_room.php', addForm, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        setAddSuccess('Thêm phòng thành công!');
        setAddForm({ dorm_name: '', room_type_name: '', capacity: '', status: '', price: '', room_number: '', current_occupancy: '' });
        window.location.reload();
      } else {
        setAddError(response.data.message || 'Thêm phòng thất bại');
      }
    } catch (err) {
      setAddError('Có lỗi xảy ra khi thêm phòng');
    }
  };

  const handleRemoveUserClick = (user, roomId) => {
    setUserToRemove({ ...user, roomId });
    setRemoveError('');
    setRemoveDialog(true);
  };

  const handleRemoveUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:80/project3/api/admin/remove_user_from_room.php', {
        student_id: userToRemove.student_id,
        room_id: userToRemove.roomId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRemoveDialog(false);
        setUserToRemove(null);
        window.location.reload();
      } else {
        setRemoveError(response.data.message || 'Xóa khỏi phòng thất bại');
      }
    } catch (err) {
      setRemoveError('Có lỗi xảy ra khi xóa khỏi phòng');
    }
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
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Tổng quan" />
        <Tab label="Xử lý phòng" />
      </Tabs>
      {tab === 0 && (
        <>
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
        </>
      )}
      {tab === 1 && (
        <>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Thêm phòng mới</Typography>
          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
          {addSuccess && <Alert severity="success" sx={{ mb: 2 }}>{addSuccess}</Alert>}
          <Box component="form" onSubmit={handleAddRoom}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Tên ký túc xá</InputLabel>
              <Select
                name="name"
                value={addForm.name || ''}
                label="Tên ký túc xá"
                onChange={handleAddChange}
              >
                <MenuItem value="">-- Chọn ký túc xá --</MenuItem>
                {dorms.map((dorm) => (
                  <MenuItem key={dorm.id} value={dorm.name}>{dorm.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Loại phòng</InputLabel>
              <Select
                name="room_type_id"
                value={addForm.room_type_id || ''}
                label="Loại phòng"
                onChange={handleAddChange}
              >
                <MenuItem value="">-- Chọn loại phòng --</MenuItem>
                {roomTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth label="Số phòng" name="room_number" value={addForm.room_number} onChange={handleAddChange} margin="normal" required />
            <TextField fullWidth label="Sức chứa" name="capacity" value={addForm.capacity} onChange={handleAddChange} margin="normal" required type="number" />
            <TextField fullWidth label="Hiện tại" name="current_occupancy" value={addForm.current_occupancy} onChange={handleAddChange} margin="normal" required type="number" />
            <TextField fullWidth label="Trạng thái" name="status" value={addForm.status} onChange={handleAddChange} margin="normal" required />
            <TextField fullWidth label="Giá phòng (VNĐ/tháng)" name="price" value={addForm.price} onChange={handleAddChange} margin="normal" required type="number" />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Thêm phòng</Button>
          </Box>
        </Paper>
        </>
      )}
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
                        <TableCell>Hành động</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedRoom.occupants.map((occupant) => (
                        <TableRow key={occupant.student_id}>
                          <TableCell>{occupant.student_id}</TableCell>
                          <TableCell>{occupant.fullname}</TableCell>
                          <TableCell>{occupant.email}</TableCell>
                          <TableCell>{occupant.phone}</TableCell>
                          <TableCell align="center">
                            <CloseIcon
                              color="error"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleRemoveUserClick(occupant, selectedRoom.room_id)}
                            />
                          </TableCell>
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
      {/* Dialog xác nhận xóa khỏi phòng */}
      <Dialog open={removeDialog} onClose={() => setRemoveDialog(false)}>
        <DialogTitle>Xác nhận xóa khỏi phòng</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa sinh viên <b>{userToRemove?.fullname}</b> ({userToRemove?.student_id}) khỏi phòng này không?</Typography>
          {removeError && <Alert severity="error" sx={{ mt: 2 }}>{removeError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialog(false)}>Hủy</Button>
          <Button onClick={handleRemoveUser} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default RoomManagement; 