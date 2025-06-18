<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

$user = getUserFromToken();
if (!$user) {
    sendResponse(false, 'Yêu cầu đăng nhập', [], 401);
}

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $student_id = sanitizeInput($data['student_id'] ?? '');
    $amount_to_pay = (float)($data['amount'] ?? 0);
    $payment_method = sanitizeInput($data['payment_method'] ?? '');

    if (empty($student_id) || $amount_to_pay <= 0 || empty($payment_method)) {
        sendResponse(false, 'Vui lòng cung cấp Mã số sinh viên, Số tiền và Phương thức thanh toán hợp lệ.');
    }

    try {
        // Lấy user_id từ bảng users bằng student_id
        $sql_get_user = "SELECT id, fullname FROM users WHERE student_id = ?";
        $stmt_get_user = $pdo->prepare($sql_get_user);
        $stmt_get_user->execute([$student_id]);
        $user_row = $stmt_get_user->fetch(PDO::FETCH_ASSOC);

        if (!$user_row) {
            sendResponse(false, 'Không tìm thấy sinh viên với mã số đã cung cấp.');
        }
        $user_id = $user_row['id'];

        // Tìm đăng ký phòng gần nhất của sinh viên chưa thanh toán đầy đủ
        $sql_reg = "
            SELECT 
                dr.id AS registration_id,
                dr.room_id,
                dr.duration,
                dr.paid_amount,
                rt.price
            FROM dorm_registrations dr
            JOIN room_types rt ON dr.room_type_id = rt.id
            WHERE dr.student_id = ? 
            ORDER BY dr.registration_date DESC
            LIMIT 1
        ";
        $stmt_reg = $pdo->prepare($sql_reg);
        $stmt_reg->execute([$student_id]);
        $registration = $stmt_reg->fetch(PDO::FETCH_ASSOC);

        if (!$registration) {
            sendResponse(false, 'Không tìm thấy đăng ký phòng nào cho sinh viên này.');
        }

        $registration_id = $registration['registration_id'];
        $room_id = $registration['room_id'];
        $total_room_cost = $registration['price'] * $registration['duration'];
        $current_paid_amount = $registration['paid_amount'];
        $remaining_balance = $total_room_cost - $current_paid_amount;

        if ($remaining_balance <= 0) {
            sendResponse(false, 'Đăng ký phòng này đã được thanh toán đầy đủ.');
        }

        if ($amount_to_pay > $remaining_balance) {
            sendResponse(false, 'Số tiền thanh toán vượt quá số dư còn lại của phòng.');
        }

        $new_paid_amount = $current_paid_amount + $amount_to_pay;

        // Bắt đầu giao dịch
        $pdo->beginTransaction();

        // Cập nhật paid_amount trong dorm_registrations
        $update_reg_sql = "UPDATE dorm_registrations SET paid_amount = ? WHERE id = ?";
        $stmt_update_reg = $pdo->prepare($update_reg_sql);
        $stmt_update_reg->execute([$new_paid_amount, $registration_id]);

        // Ghi lại giao dịch vào bảng payments
        $sql_insert_payment = "INSERT INTO payments (user_id, room_id, payment_type, amount, payment_date, status) VALUES (?, ?, ?, ?, CURDATE(), 'paid')";
        $stmt_insert_payment = $pdo->prepare($sql_insert_payment);
        $payment_type = 'room'; // Always 'room' for this API
        $stmt_insert_payment->execute([$user_id, $room_id, $payment_type, $amount_to_pay]);

        $pdo->commit();
        sendResponse(true, 'Thanh toán tiền phòng thành công!', [
            'registration_id' => $registration_id,
            'amount_paid' => $amount_to_pay,
            'new_total_paid' => $new_paid_amount,
            'remaining_balance' => $total_room_cost - $new_paid_amount
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        sendResponse(false, 'Thanh toán thất bại: ' . $e->getMessage());
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Lấy danh sách các đăng ký phòng của người dùng và thông tin thanh toán liên quan
    $sql_get_registrations = "
        SELECT 
            dr.id AS registration_id,
            dr.student_id,
            dr.full_name,
            u.phone, 
            u.email,
            dr.check_in_date,
            dr.duration,
            dr.notes,
            dr.status,
            dr.paid_amount,
            r.room_number,
            d.name AS dorm_name,
            rt.name AS room_type_name,
            rt.price
        FROM dorm_registrations dr
        JOIN users u ON dr.student_id = u.student_id
        JOIN rooms r ON dr.room_id = r.id
        JOIN dorms d ON dr.dorm_id = d.id
        JOIN room_types rt ON dr.room_type_id = rt.id
        WHERE dr.student_id = ?
        ORDER BY dr.registration_date DESC
    ";

    try {
        $stmt_get_registrations = $pdo->prepare($sql_get_registrations);
        $stmt_get_registrations->execute([$user['student_id']]);

        $registrations = [];
        while ($row = $stmt_get_registrations->fetch(PDO::FETCH_ASSOC)) {
            $total_cost = $row['price'] * $row['duration'];
            $row['total_cost'] = $total_cost;
            $row['remaining_balance'] = $total_cost - $row['paid_amount'];
            $registrations[] = $row;
        }

        sendResponse(true, 'Danh sách đăng ký phòng và thông tin thanh toán', $registrations);
    } catch (PDOException $e) {
        sendResponse(false, 'Lỗi truy vấn cơ sở dữ liệu: ' . $e->getMessage());
    }
} else {
    sendResponse(false, 'Phương thức không hợp lệ');
}
?> 