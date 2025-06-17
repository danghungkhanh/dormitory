import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CardHeader
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';

function DormRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    companion_ids: '',
    room_type: '',
    dorm_id: '',
    room_id: '',
    check_in_date: '',
    duration: '',
    notes: '',
    agree_terms: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dorms, setDorms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [durations, setDurations] = useState([]);
  const [roomTypeInfo, setRoomTypeInfo] = useState([]);

  useEffect(() => {
    // Fetch user info (student_id, full_name) from localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setFormData(prev => ({
        ...prev,
        student_id: user.student_id || '',
        full_name: user.fullname || '',
      }));
    }

    // Fetch dorms
    axios.get('http://localhost:80/project3/api/dorms.php')
      .then(response => {
        if (response.data.success) {
          setDorms(response.data.data);
        }
      })
      .catch(err => console.error('Error fetching dorms:', err));

    // Fetch durations (example, adjust as needed)
    setDurations([
      { value: 1, label: '1 tháng' },
      { value: 3, label: '3 tháng' },
      { value: 6, label: '6 tháng' },
      { value: 12, label: '12 tháng' },
    ]);

    // Fetch room types info
    axios.get('http://localhost:80/project3/api/room_types.php')
      .then(response => {
        if (response.data.success) {
          setRoomTypeInfo(response.data.data);
        }
      })
      .catch(err => console.error('Error fetching room types info:', err));

  }, []);

  useEffect(() => {
    if (formData.dorm_id) {
      // Fetch room types based on dorm
      axios.get(`http://localhost:80/project3/api/room_types.php?dorm_id=${formData.dorm_id}`)
        .then(response => {
          if (response.data.success) {
            setRoomTypes(response.data.data);
          }
        })
        .catch(err => console.error('Error fetching room types:', err));
    }
  }, [formData.dorm_id]);

  useEffect(() => {
    if (formData.room_type && formData.dorm_id) {
      // Fetch available rooms based on dorm and room type
      axios.get(`http://localhost:80/project3/api/rooms.php?dorm_id=${formData.dorm_id}&room_type=${formData.room_type}&available=true`)
        .then(response => {
          if (response.data.success) {
            setRooms(response.data.data);
          }
        })
        .catch(err => console.error('Error fetching rooms:', err));
    }
  }, [formData.room_type, formData.dorm_id]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.agree_terms) {
      setError('Bạn phải đồng ý với nội quy ký túc xá.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:80/project3/api/dorm_register.php',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.data.success) {
        setSuccess(response.data.message);
        // Optionally clear form or redirect
        // navigate('/home');
      } else {
        setError(response.data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      setError('Có lỗi xảy ra khi đăng ký nội trú.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 1 }} /> Đăng ký nội trú
        </Typography>
        <Typography variant="body2">
          <Link component={Link} to="/" color="inherit" sx={{ textDecoration: 'none' }}>
            Trang chủ
          </Link>
          {' / '}
          Đăng ký nội trú
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <span style={{ fontWeight: 'bold' }}>Chú ý:</span> Đơn đăng ký nội trú dành cho sinh viên. Vui lòng điền đầy đủ thông tin để được xếp phòng phù hợp.
        </Typography>
      </Alert>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: '10px' }}>
        <CardHeader title="Đăng ký nội trú mới" sx={{ backgroundColor: '#1976d2', color: 'white', borderRadius: '10px 10px 0 0', mx: -4, mt: -4, mb: 2, p: 2 }} />
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Cột 1 (trái) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã số sinh viên"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Ký túc xá *</InputLabel>
                <Select
                  name="dorm_id"
                  value={formData.dorm_id}
                  label="Ký túc xá *"
                  onChange={handleChange}
                >
                  <MenuItem value="">-- Chọn ký túc xá --</MenuItem>
                  {dorms.map((dorm) => (
                    <MenuItem key={dorm.id} value={dorm.id}>
                      {dorm.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Loại phòng *</InputLabel>
                <Select
                  name="room_type"
                  value={formData.room_type}
                  label="Loại phòng *"
                  onChange={handleChange}
                  disabled={!formData.dorm_id}
                >
                  <MenuItem value="">-- Chọn loại phòng --</MenuItem>
                  {roomTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Phòng *</InputLabel>
                <Select
                  name="room_id"
                  value={formData.room_id}
                  label="Phòng *"
                  onChange={handleChange}
                  disabled={!formData.dorm_id || !formData.room_type}
                >
                  <MenuItem value="">-- Chọn phòng --</MenuItem>
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        {`Phòng ${room.room_number} (${room.capacity - room.current_occupancy} trống)`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>Chọn loại phòng trước để hiển thị danh sách phòng có sẵn.</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Cột 2 (phải) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Người ở cùng (nếu có)"
                name="companion_ids"
                value={formData.companion_ids}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                placeholder="Nhập mã số sinh viên của người bạn muốn ở cùng, mỗi người một dòng"
                helperText="Nếu bạn muốn ở cùng với bạn bè, hãy nhập mã số sinh viên của họ ở đây."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày nhận phòng *"
                name="check_in_date"
                type="date"
                value={formData.check_in_date}
                onChange={handleChange}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: <CalendarTodayIcon />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Thời gian ở *</InputLabel>
                <Select
                  name="duration"
                  value={formData.duration}
                  label="Thời gian ở *"
                  onChange={handleChange}
                >
                  <MenuItem value="">-- Chọn thời gian --</MenuItem>
                  {durations.map((d) => (
                    <MenuItem key={d.value} value={d.value}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ghi chú"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                placeholder="Nhập các yêu cầu đặc biệt (nếu có)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agree_terms}
                    onChange={handleChange}
                    name="agree_terms"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    Tôi đã đọc và đồng ý với <Link href="#" onClick={(e) => { e.preventDefault(); alert('Nội dung nội quy ký túc xá'); }}>nội quy ký túc xá</Link>
                  </Typography>
                }
              />
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, p: 1.5 }}
          >
            Đăng ký
          </Button>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, borderRadius: '10px' }}>
        <CardHeader title="Thông tin các loại phòng" sx={{ backgroundColor: '#00bcd4', color: 'white', borderRadius: '10px 10px 0 0', mx: -4, mt: -4, mb: 2, p: 2 }} />
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="room type info table">
            <TableHead>
              <TableRow>
                <TableCell>Loại phòng</TableCell>
                <TableCell align="right">Sức chứa</TableCell>
                <TableCell align="right">Diện tích</TableCell>
                <TableCell align="right">Giá/tháng</TableCell>
                <TableCell>Mô tả</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomTypeInfo.length > 0 ? (
                roomTypeInfo.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{row.name}</TableCell>
                    <TableCell align="right">{row.capacity} người</TableCell>
                    <TableCell align="right">{row.area} m²</TableCell>
                    <TableCell align="right">{parseInt(row.price).toLocaleString('vi-VN')} VNĐ</TableCell>
                    <TableCell>{row.description}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">Không có thông tin loại phòng.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default DormRegister;