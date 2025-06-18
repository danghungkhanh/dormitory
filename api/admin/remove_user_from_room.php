<?php
require_once '../../includes/config.php';
require_once '../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method.');
}

// Xác thực token admin
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
$decoded = verifyToken($token);
if (!$decoded || !isset($decoded['is_admin']) || $decoded['is_admin'] != 1) {
    sendResponse(false, 'Không có quyền truy cập');
}

$data = json_decode(file_get_contents('php://input'), true);
$student_id = $data['student_id'] ?? '';
$room_id = $data['room_id'] ?? '';
if (!$student_id || !$room_id) {
    sendResponse(false, 'Thiếu thông tin student_id hoặc room_id');
}

try {
    // Xóa đăng ký nội trú của sinh viên với phòng này
    $stmt = $pdo->prepare('DELETE FROM dorm_registrations WHERE student_id = ? AND room_id = ?');
    $stmt->execute([$student_id, $room_id]);
    if ($stmt->rowCount() === 0) {
        sendResponse(false, 'Không tìm thấy đăng ký nội trú để xóa');
    }
    // Giảm current_occupancy của phòng
    $stmt2 = $pdo->prepare('UPDATE rooms SET current_occupancy = GREATEST(current_occupancy - 1, 0) WHERE id = ?');
    $stmt2->execute([$room_id]);
    sendResponse(true, 'Đã xóa sinh viên khỏi phòng thành công');
} catch (PDOException $e) {
    sendResponse(false, 'Lỗi khi xóa khỏi phòng: ' . $e->getMessage());
} 