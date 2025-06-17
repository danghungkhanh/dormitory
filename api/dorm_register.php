<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

// Chỉ chấp nhận yêu cầu POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method.');
}

// Lấy dữ liệu JSON từ request body
$input = json_decode(file_get_contents('php://input'), true);

// Xác thực token JWT
$user_data = getUserFromToken();
if (!$user_data) {
    sendResponse(false, 'Unauthorized access.', [], 401);
}

// Lấy thông tin người dùng từ token
// Kiểm tra xem student_id có tồn tại và không rỗng không
if (!isset($user_data['student_id']) || empty($user_data['student_id'])) {
    sendResponse(false, 'Student ID not found in token. Please update your profile.');
}
if (!isset($user_data['fullname']) || empty($user_data['fullname'])) {
    sendResponse(false, 'Full name not found in token. Please update your profile.');
}

$student_id = $user_data['student_id'];
$full_name = $user_data['fullname'];

// Lấy dữ liệu từ input
$companion_ids = sanitizeInput($input['companion_ids'] ?? '');
$dorm_id = sanitizeInput($input['dorm_id'] ?? '');
$room_type = sanitizeInput($input['room_type'] ?? '');
$room_id = sanitizeInput($input['room_id'] ?? '');
$check_in_date = sanitizeInput($input['check_in_date'] ?? '');
$duration = sanitizeInput($input['duration'] ?? '');
$notes = sanitizeInput($input['notes'] ?? '');
$agree_terms = (bool)($input['agree_terms'] ?? false);

// Kiểm tra các trường bắt buộc
if (empty($dorm_id) || empty($room_type) || empty($room_id) || empty($check_in_date) || empty($duration)) {
    sendResponse(false, 'Please fill in all required fields (Dorm, Room Type, Room, Check-in Date, Duration).');
}

if (!$agree_terms) {
    sendResponse(false, 'You must agree to the dormitory rules.');
}

try {
    // Kiểm tra xem sinh viên đã đăng ký nội trú chưa
    $check_sql = "SELECT COUNT(*) FROM dorm_registrations WHERE student_id = ?";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->execute([$student_id]);
    $registration_count = $check_stmt->fetchColumn();

    if ($registration_count > 0) {
        sendResponse(false, 'You have already registered for a dormitory. Each student is allowed to register only once.');
    }

    // Chuẩn bị câu lệnh SQL để chèn dữ liệu
    $sql = "INSERT INTO dorm_registrations (student_id, full_name, companion_ids, dorm_id, room_type_id, room_id, check_in_date, duration, notes, agree_terms, registration_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)";

    // Giả sử status mặc định là 'pending'
    $status = 'pending';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $student_id,
        $full_name,
        $companion_ids,
        $dorm_id,
        $room_type,
        $room_id,
        $check_in_date,
        $duration,
        $notes,
        $agree_terms,
        $status
    ]);

    $registration_id = $pdo->lastInsertId();

    $room_update_message = 'Failed to update room occupancy.';

    // Tăng current_occupancy của phòng
    $update_room_sql = "UPDATE rooms SET current_occupancy = current_occupancy + 1 WHERE id = ?";
    $update_room_stmt = $pdo->prepare($update_room_sql);
    if ($update_room_stmt->execute([$room_id])) {
        $room_update_message = 'Room occupancy updated successfully.';
    } else {
        $room_update_message = 'Error updating room occupancy.';
        error_log("Error updating room current_occupancy: " . implode(', ', $update_room_stmt->errorInfo()));
    }

    sendResponse(true, 'Dormitory registration successful!', [
        'registration_id' => $registration_id,
        'room_update_status' => $room_update_message
    ]);

} catch (PDOException $e) {
    sendResponse(false, 'Registration failed: ' . $e->getMessage());
} 