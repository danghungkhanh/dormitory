<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

$user = getUserFromToken();
if (!$user) {
    sendResponse(false, 'Yêu cầu đăng nhập', [], 401);
}

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $room_id = filter_var($data['room_id'] ?? '', FILTER_VALIDATE_INT);
    $month = filter_var($data['month'] ?? '', FILTER_VALIDATE_INT);
    $year = filter_var($data['year'] ?? '', FILTER_VALIDATE_INT);
    $amount = (float)($data['amount'] ?? 0);

    if (!$room_id || !$month || !$year || $amount <= 0) {
        sendResponse(false, 'Vui lòng cung cấp đầy đủ thông tin thanh toán tiền nước hợp lệ (phòng, tháng, năm, số tiền).');
    }

    $user_id = $user['user_id'];
    $payment_type = 'water';

    try {
        // Check if payment already exists
        $sql_check_payment = "SELECT COUNT(*) FROM payments WHERE user_id = ? AND room_id = ? AND payment_type = ? AND YEAR(payment_date) = ? AND MONTH(payment_date) = ? AND status = 'completed'";
        $stmt_check_payment = $pdo->prepare($sql_check_payment);
        $stmt_check_payment->execute([$user_id, $room_id, $payment_type, $year, $month]);
        $count = $stmt_check_payment->fetchColumn();

        if ($count > 0) {
            sendResponse(false, 'Hóa đơn tiền nước này đã được thanh toán rồi.');
        }

        // Lấy thông tin sử dụng nước để xác nhận số tiền
        $sql_usage = "SELECT water_m3 FROM utility_readings WHERE room_id = ? AND month = ? AND year = ?";
        $stmt_usage = $pdo->prepare($sql_usage);
        $stmt_usage->execute([$room_id, $month, $year]);
        $usage_data = $stmt_usage->fetch(PDO::FETCH_ASSOC);

        if (!$usage_data) {
            sendResponse(false, 'Không tìm thấy dữ liệu sử dụng nước cho tháng này.');
        }

        $calculated_amount = $usage_data['water_m3'] * 2000; // 2.000 VNĐ/m3

        if ($amount < $calculated_amount) {
            sendResponse(false, 'Số tiền thanh toán không đủ. Số tiền cần trả: ' . number_format($calculated_amount) . ' VNĐ.');
        }

        $pdo->beginTransaction();

        $sql_insert_payment = "INSERT INTO payments (user_id, room_id, payment_type, amount, payment_date, status) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt_insert_payment = $pdo->prepare($sql_insert_payment);
        $payment_status = 'completed';
        $payment_date_for_bill = date('Y-m-d', mktime(0, 0, 0, $month, 1, $year));

        $stmt_insert_payment->execute([$user_id, $room_id, $payment_type, $amount, $payment_date_for_bill, $payment_status]);

        $pdo->commit();

        sendResponse(true, 'Thanh toán tiền nước thành công!', ['water_cost' => $amount]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        sendResponse(false, 'Thanh toán thất bại: ' . $e->getMessage());
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Lấy room_id của người dùng
        $sql_get_room = "SELECT room_id FROM dorm_registrations WHERE student_id = ? ORDER BY registration_date DESC LIMIT 1";
        $stmt_get_room = $pdo->prepare($sql_get_room);
        $stmt_get_room->execute([$user['student_id']]);
        $room_data = $stmt_get_room->fetch(PDO::FETCH_ASSOC);

        if (!$room_data) {
            sendResponse(false, 'Không tìm thấy đăng ký phòng cho người dùng này.');
        }
        $room_id = $room_data['room_id'];

        // Lấy bản ghi sử dụng nước mới nhất cho phòng
        $sql_latest_reading = "SELECT water_m3, month, year FROM utility_readings WHERE room_id = ? ORDER BY year DESC, month DESC LIMIT 1";
        $stmt_latest_reading = $pdo->prepare($sql_latest_reading);
        $stmt_latest_reading->execute([$room_id]);
        $latest_reading = $stmt_latest_reading->fetch(PDO::FETCH_ASSOC);

        if (!$latest_reading) {
            sendResponse(true, 'Không có dữ liệu sử dụng nước cho phòng này.', [
                'room_id' => $room_id,
                'month' => null,
                'year' => null,
                'water_m3' => 0,
                'water_cost' => 0,
                'water_paid' => true, // Coi như đã thanh toán nếu không có dữ liệu để tránh hiển thị nút thanh toán
            ]);
        }

        $water_m3 = $latest_reading['water_m3'] ?? 0;
        $bill_month = $latest_reading['month'];
        $bill_year = $latest_reading['year'];
        $water_cost = $water_m3 * 2000; // 2.000 VNĐ/m3

        // Kiểm tra xem hóa đơn này đã được thanh toán hay chưa
        $water_paid = false;
        $sql_check_paid = "SELECT COUNT(*) FROM payments WHERE user_id = ? AND room_id = ? AND payment_type = 'water' AND YEAR(payment_date) = ? AND MONTH(payment_date) = ? AND status = 'completed'";
        $stmt_check_paid = $pdo->prepare($sql_check_paid);
        $stmt_check_paid->execute([$user['user_id'], $room_id, $bill_year, $bill_month]);
        $count_paid = $stmt_check_paid->fetchColumn();

        if ($count_paid > 0) {
            $water_paid = true;
        }

        sendResponse(true, 'Thông tin hóa đơn tiền nước', [
            'room_id' => $room_id,
            'month' => $bill_month,
            'year' => $bill_year,
            'water_m3' => $water_m3,
            'water_cost' => $water_cost,
            'water_paid' => $water_paid,
        ]);

    } catch (PDOException $e) {
        sendResponse(false, 'Lỗi truy vấn cơ sở dữ liệu: ' . $e->getMessage());
    }
} else {
    sendResponse(false, 'Phương thức không hợp lệ');
}
?> 