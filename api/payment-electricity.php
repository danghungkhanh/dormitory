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
        sendResponse(false, 'Vui lòng cung cấp đầy đủ thông tin thanh toán tiền điện hợp lệ (phòng, tháng, năm, số tiền).');
    }

    $user_id = $user['user_id'];
    $payment_type = 'electricity';

    try {
        // Check if payment already exists
        $sql_check_payment = "SELECT COUNT(*) FROM payments WHERE user_id = ? AND room_id = ? AND payment_type = ? AND YEAR(payment_date) = ? AND MONTH(payment_date) = ? AND status = 'completed'";
        $stmt_check_payment = $pdo->prepare($sql_check_payment);
        $stmt_check_payment->execute([$user_id, $room_id, $payment_type, $year, $month]);
        $count = $stmt_check_payment->fetchColumn();

        if ($count > 0) {
            sendResponse(false, 'Hóa đơn tiền điện này đã được thanh toán rồi.');
        }

        $sql_usage = "SELECT electricity_kwh FROM utility_readings WHERE room_id = ? AND month = ? AND year = ?";
        $stmt_usage = $pdo->prepare($sql_usage);
        $stmt_usage->execute([$room_id, $month, $year]);
        $usage_data = $stmt_usage->fetch(PDO::FETCH_ASSOC);

        if (!$usage_data) {
            sendResponse(false, 'Không tìm thấy dữ liệu sử dụng điện cho tháng này.');
        }

        $electricity_kwh = $usage_data['electricity_kwh'] ?? 0;
        $calculated_amount = $electricity_kwh * 1000; // 1.000 VNĐ/kWh

        if ($amount < $calculated_amount) {
            sendResponse(false, 'Số tiền thanh toán không đủ. Số tiền cần trả: ' . number_format($calculated_amount) . ' VNĐ.');
        }

        $sql_insert_payment = "INSERT INTO payments (user_id, room_id, payment_type, amount, payment_date, status) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt_insert_payment = $pdo->prepare($sql_insert_payment);
        $payment_status = 'completed';
        $payment_date_for_bill = date('Y-m-d', mktime(0, 0, 0, $month, 1, $year)); // Sử dụng tháng và năm của hóa đơn

        $stmt_insert_payment->execute([$user_id, $room_id, $payment_type, $amount, $payment_date_for_bill, $payment_status]);

        sendResponse(true, 'Thanh toán tiền điện thành công!', ['electricity_cost' => $amount]);

    } catch (PDOException $e) {
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

        $sql_latest_reading = "SELECT electricity_kwh, month, year FROM utility_readings WHERE room_id = ? ORDER BY year DESC, month DESC LIMIT 1";
        $stmt_latest_reading = $pdo->prepare($sql_latest_reading);
        $stmt_latest_reading->execute([$room_id]);
        $latest_reading = $stmt_latest_reading->fetch(PDO::FETCH_ASSOC);

        if (!$latest_reading) {
            sendResponse(true, 'Không có dữ liệu sử dụng điện cho phòng này.', [
                'room_id' => $room_id,
                'month' => null,
                'year' => null,
                'electricity_kwh' => 0,
                'electricity_cost' => 0,
                'electricity_paid' => true, // Coi như đã thanh toán nếu không có dữ liệu để tránh hiển thị nút thanh toán
            ]);
        }

        $electricity_kwh = $latest_reading['electricity_kwh'] ?? 0;
        $bill_month = $latest_reading['month'];
        $bill_year = $latest_reading['year'];
        $electricity_cost = $electricity_kwh * 1000; // 1.000 VNĐ/kWh

        $electricity_paid = false;
        $sql_check_paid = "SELECT COUNT(*) FROM payments WHERE user_id = ? AND room_id = ? AND payment_type = 'electricity' AND YEAR(payment_date) = ? AND MONTH(payment_date) = ? AND status = 'completed'";
        $stmt_check_paid = $pdo->prepare($sql_check_paid);
        $stmt_check_paid->execute([$user['user_id'], $room_id, $bill_year, $bill_month]);
        $count_paid = $stmt_check_paid->fetchColumn();

        if ($count_paid > 0) {
            $electricity_paid = true;
        }

        sendResponse(true, 'Thông tin hóa đơn tiền điện', [
            'room_id' => $room_id,
            'month' => $bill_month,
            'year' => $bill_year,
            'electricity_kwh' => $electricity_kwh,
            'electricity_cost' => $electricity_cost,
            'electricity_paid' => $electricity_paid,
        ]);

    } catch (PDOException $e) {
        sendResponse(false, 'Lỗi truy vấn cơ sở dữ liệu: ' . $e->getMessage());
    }
} else {
    sendResponse(false, 'Phương thức không hợp lệ');
}
?> 