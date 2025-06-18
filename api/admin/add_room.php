<?php
require_once '../../includes/config.php';
require_once '../../includes/functions.php';

// Chỉ chấp nhận POST
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
$required = ['name', 'room_type_id', 'room_number', 'capacity', 'current_occupancy', 'status'];
foreach ($required as $field) {
    if (empty($data[$field]) && $data[$field] !== 0 && $data[$field] !== '0') {
        sendResponse(false, 'Thiếu thông tin: ' . $field);
    }
}

// Tra cứu dorm_id từ tên ký túc xá
$stmt = $pdo->prepare('SELECT id FROM dorms WHERE name = ?');
$stmt->execute([$data['name']]);
$dorm = $stmt->fetch();
if (!$dorm) {
    sendResponse(false, 'Không tìm thấy ký túc xá với tên: ' . $data['name']);
}
$dorm_id = $dorm['id'];

try {
    $stmt = $pdo->prepare('INSERT INTO rooms (dorm_id, room_number, room_type_id, capacity, current_occupancy, status) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $dorm_id,
        $data['room_number'],
        intval($data['room_type_id']),
        intval($data['capacity']),
        intval($data['current_occupancy']),
        $data['status']
    ]);
    sendResponse(true, 'Thêm phòng thành công!');
} catch (PDOException $e) {
    sendResponse(false, 'Lỗi khi thêm phòng: ' . $e->getMessage());
} 