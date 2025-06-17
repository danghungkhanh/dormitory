<?php
require_once '../../includes/config.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

$user = getUserFromToken();

// Kiểm tra quyền quản trị viên
if (!$user || !$user['is_admin']) {
    sendResponse(false, 'Không có quyền truy cập.', [], 403);
}

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $student_id = filter_var($data['student_id'] ?? '', FILTER_SANITIZE_STRING);
    $month = filter_var($data['month'] ?? '', FILTER_VALIDATE_INT);
    $year = filter_var($data['year'] ?? '', FILTER_VALIDATE_INT);
    $electricity_kwh = filter_var($data['electricity_kwh'] ?? 0, FILTER_VALIDATE_FLOAT);
    $water_m3 = filter_var($data['water_m3'] ?? 0, FILTER_VALIDATE_FLOAT);

    if (!$student_id || !$month || !$year || $electricity_kwh === false || $water_m3 === false) {
        sendResponse(false, 'Vui lòng cung cấp đầy đủ và hợp lệ thông tin sinh viên, tháng, năm, số kWh điện và m3 nước.');
    }

    try {
        // Lấy room_id từ student_id
        $sql_get_room_id = "SELECT room_id FROM dorm_registrations WHERE student_id = ? ORDER BY registration_date DESC LIMIT 1";
        $stmt_get_room_id = $pdo->prepare($sql_get_room_id);
        $stmt_get_room_id->execute([$student_id]);
        $room_data = $stmt_get_room_id->fetch();

        if (!$room_data || !isset($room_data['room_id'])) {
            sendResponse(false, 'Không tìm thấy phòng cho sinh viên này. Vui lòng đảm bảo sinh viên đã đăng ký nội trú.');
        }
        $room_id = $room_data['room_id'];

        // Kiểm tra xem đã có bản ghi cho tháng và năm này chưa
        $sql_check = "SELECT id FROM utility_readings WHERE room_id = ? AND month = ? AND year = ?";
        $stmt_check = $pdo->prepare($sql_check);
        $stmt_check->execute([$room_id, $month, $year]);
        $existing_reading = $stmt_check->fetch();

        if ($existing_reading) {
            // Cập nhật bản ghi hiện có
            $sql_update = "UPDATE utility_readings SET electricity_kwh = ?, water_m3 = ? WHERE id = ?";
            $stmt_update = $pdo->prepare($sql_update);
            $stmt_update->execute([$electricity_kwh, $water_m3, $existing_reading['id']]);
            sendResponse(true, 'Cập nhật dữ liệu sử dụng điện nước thành công!');
        } else {
            // Chèn bản ghi mới
            $sql_insert = "INSERT INTO utility_readings (room_id, month, year, electricity_kwh, water_m3) VALUES (?, ?, ?, ?, ?)";
            $stmt_insert = $pdo->prepare($sql_insert);
            $stmt_insert->execute([$room_id, $month, $year, $electricity_kwh, $water_m3]);
            sendResponse(true, 'Thêm dữ liệu sử dụng điện nước thành công!');
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Lỗi cơ sở dữ liệu: ' . $e->getMessage());
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Admin có thể xem tất cả các bản ghi sử dụng điện nước, cố gắng lấy thông tin sinh viên liên quan
        $sql_get_readings = "
            SELECT 
                ur.*, 
                r.room_number, 
                dr.student_id, 
                u.fullname 
            FROM 
                utility_readings ur 
            JOIN 
                rooms r ON ur.room_id = r.id 
            LEFT JOIN 
                dorm_registrations dr ON ur.room_id = dr.room_id 
                                        AND MONTH(dr.registration_date) = ur.month 
                                        AND YEAR(dr.registration_date) = ur.year
            LEFT JOIN 
                users u ON dr.student_id = u.student_id
            ORDER BY 
                ur.year DESC, ur.month DESC, r.room_number ASC";
        
        $stmt = $pdo->query($sql_get_readings);
        $readings = $stmt->fetchAll();
        
        sendResponse(true, 'Danh sách dữ liệu sử dụng điện nước', $readings);
    } catch (PDOException $e) {
        sendResponse(false, 'Lỗi cơ sở dữ liệu: ' . $e->getMessage());
    }
} else {
    sendResponse(false, 'Phương thức không hợp lệ.');
}

$conn->close();
?> 