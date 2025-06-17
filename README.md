# Hệ thống Quản lý Ký túc xá

Hệ thống quản lý ký túc xá cho trường Đại học Mỏ - Địa chất (HUMG) được xây dựng bằng React.js và PHP.

## Tính năng

- Đăng ký và đăng nhập tài khoản
- Đăng ký nội trú
- Thanh toán tiền phòng
- Thanh toán tiền điện, nước
- Đăng ký dịch vụ giặt sấy
- Quản lý phòng
- Quản lý người dùng
- Quản lý thanh toán

## Yêu cầu hệ thống

- PHP 7.4 trở lên
- MySQL 5.7 trở lên
- Node.js 14.0 trở lên
- Composer

## Cài đặt

1. Clone repository:
```bash
git clone [repository-url]
cd dormitory-management
```

2. Cài đặt dependencies cho PHP:
```bash
composer install
```

3. Cài đặt dependencies cho React:
```bash
npm install
```

4. Tạo database và import cấu trúc:
```bash
mysql -u root -p < database.sql
```

5. Cấu hình database:
- Mở file `includes/config.php`
- Cập nhật thông tin kết nối database

6. Khởi động development server:
```bash
# Terminal 1 - PHP server
php -S localhost:8000

# Terminal 2 - React development server
npm start
```

## Tài khoản mặc định

- Email: admin@humg.edu.vn
- Password: password

## Cấu trúc thư mục

```
├── api/              # PHP API endpoints
├── includes/         # PHP helper files
├── public/          # Public assets
├── src/             # React source code
│   ├── components/  # React components
│   ├── assets/      # Static assets
│   └── styles/      # CSS styles
└── vendor/          # PHP dependencies
```

## API Endpoints

### Authentication
- POST /api/login.php - Đăng nhập
- POST /api/register.php - Đăng ký

### Dormitory Registration
- POST /api/dorm-register.php - Đăng ký nội trú
- GET /api/dorm-registrations.php - Lấy danh sách đăng ký

### Payments
- POST /api/payments.php - Tạo thanh toán mới
- GET /api/payments.php - Lấy danh sách thanh toán

### Laundry
- POST /api/laundry-register.php - Đăng ký giặt sấy
- GET /api/laundry-registrations.php - Lấy danh sách đăng ký giặt sấy

## Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 