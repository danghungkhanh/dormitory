import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Alert,
  CardHeader,
  Paper,
} from '@mui/material';

function Home() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user && user.is_admin === 1;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Jumbotron section */}
      <Paper elevation={3} sx={{ textAlign: 'center', mb: 4, p: 4, borderRadius: '10px', boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          KÝ TÚC XÁ DORMITORY
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          HUMG UNIVERSITY
        </Typography>
      </Paper>

      {!isLoggedIn ? (
        <Card sx={{ maxWidth: 600, mx: 'auto', borderRadius: '10px', boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)' }}>
          <CardHeader title="Đăng nhập vào hệ thống" sx={{ backgroundColor: 'primary.main', color: 'white', borderRadius: '10px 10px 0 0' }} />
          <CardContent>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Vui lòng đăng nhập để sử dụng các dịch vụ
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ mr: 2 }}
            >
              Đăng nhập
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
            >
              Đăng ký
            </Button>
          </CardActions>
        </Card>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <Alert severity="info" sx={{ textAlign: 'left' }}>
              <Typography variant="h5">Xin chào, {user.fullname}</Typography>
              <Typography variant="body1">Mã số sinh viên: {user.student_id}</Typography>
            </Alert>
          </Box>

          {!isAdmin && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: '10px', boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)' }}>
                  <CardHeader title="Đăng ký nội trú" sx={{ backgroundColor: 'primary.main', color: 'white', borderRadius: '10px 10px 0 0' }} />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Đơn đăng ký nội trú dành cho sinh viên
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/dorm-register')}
                    >
                      Đăng ký ngay
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: '10px', boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)' }}>
                  <CardHeader title="Thanh toán tiền phòng" sx={{ backgroundColor: 'success.main', color: 'white', borderRadius: '10px 10px 0 0' }} />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Thanh toán theo từng sinh viên nội trú
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => navigate('/payment-room')}
                    >
                      Thanh toán
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: '10px', boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)' }}>
                  <CardHeader title="Thanh toán tiền điện" sx={{ backgroundColor: 'info.main', color: 'white', borderRadius: '10px 10px 0 0' }} />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Thanh toán theo từng phòng
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      color="info"
                      onClick={() => navigate('/payment-electricity')}
                    >
                      Thanh toán
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: '10px', boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)' }}>
                  <CardHeader title="Thanh toán tiền nước" sx={{ backgroundColor: 'warning.main', color: '#000', borderRadius: '10px 10px 0 0' }} />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Thanh toán theo từng phòng
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => navigate('/payment-water')}
                    >
                      Thanh toán
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          )}

          {isAdmin && (
            <Box sx={{ mt: 4 }}>
              <Card sx={{ borderRadius: '10px', boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)' }}>
                <CardHeader title="Quản lý hệ thống" sx={{ backgroundColor: '#424242', color: 'white', borderRadius: '10px 10px 0 0' }} />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        onClick={() => navigate('/admin/users')}
                      >
                        Quản lý người dùng
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        onClick={() => navigate('/admin/rooms')}
                      >
                        Quản lý phòng
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        onClick={() => navigate('/admin/payments')}
                      >
                        Quản lý thanh toán
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        onClick={() => navigate('/admin/utility-readings')}
                      >
                        Quản lý số liệu điện nước
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default Home;