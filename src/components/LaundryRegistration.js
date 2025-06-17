import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Paper,
    Alert,
    CircularProgress,
    Divider,
    Container
} from '@mui/material';
import axios from 'axios';

const LaundryRegistration = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dormInfo, setDormInfo] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [estimatedDate, setEstimatedDate] = useState('');

    // Lấy thông tin phòng của người dùng
    useEffect(() => {
        const fetchDormInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Vui lòng đăng nhập để sử dụng dịch vụ');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('/api/user/dorm_info.php', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.data.success) {
                    setDormInfo(response.data.data);
                } else {
                    setError(response.data.message || 'Bạn cần đăng ký ký túc xá trước khi sử dụng dịch vụ giặt sấy');
                }
            } catch (err) {
                console.error('Error fetching dorm info:', err);
                setError(err.response?.data?.message || 'Không thể lấy thông tin phòng');
            } finally {
                setLoading(false);
            }
        };

        fetchDormInfo();
    }, []);

    // Tính toán tổng tiền và ngày hoàn thành dự kiến
    useEffect(() => {
        if (quantity) {
            const amount = parseInt(quantity) * 10000; // 1kg = 10.000đ
            setTotalAmount(amount);

            const today = new Date();
            const completionDate = new Date(today);
            completionDate.setDate(today.getDate() + parseInt(quantity)); // 1kg = 1 ngày
            setEstimatedDate(completionDate.toLocaleDateString('vi-VN'));
        } else {
            setTotalAmount(0);
            setEstimatedDate('');
        }
    }, [quantity]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!dormInfo || !dormInfo.room_number) {
            setError('Không có thông tin phòng. Vui lòng đăng ký ký túc xá trước.');
            return;
        }
        if (!quantity || quantity <= 0) {
            setError('Vui lòng nhập số kg quần áo hợp lệ');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const payload = {
                room_number: dormInfo.room_number,
                quantity: parseInt(quantity),
                service_type: 'wash'
            };

            const response = await axios.post('/api/laundry-register.php', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setSuccess('Đăng ký giặt sấy thành công!');
                setQuantity('');
                setTotalAmount(0);
                setEstimatedDate('');
            } else {
                setError(response.data.message || 'Đăng ký thất bại');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !dormInfo) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    Đăng ký giặt sấy
                </Typography>

                {dormInfo && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1">
                            Phòng của bạn: {dormInfo.room_number}
                        </Typography>
                        {dormInfo.registration_status !== 'accepted' && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                                Trạng thái đăng ký phòng của bạn là "{dormInfo.registration_status}". Dịch vụ giặt sấy có thể bị hạn chế.
                            </Alert>
                        )}
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Số kg quần áo"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        margin="normal"
                        required
                        inputProps={{ min: 1 }}
                    />

                    {quantity && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">
                                Tổng tiền: {totalAmount.toLocaleString('vi-VN')} VNĐ
                            </Typography>
                            <Typography variant="subtitle1">
                                Dự kiến hoàn thành: {estimatedDate}
                            </Typography>
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={loading || !quantity || !dormInfo || !dormInfo.room_number}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Đăng ký và thanh toán'}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default LaundryRegistration; 