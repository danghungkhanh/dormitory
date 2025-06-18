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
if (!isset($data['user_id'])) {
    sendResponse(false, 'Thiếu user_id');
}

$user_id = intval($data['user_id']);

// Không cho phép admin tự xóa chính mình
if ($decoded['user_id'] == $user_id) {
    sendResponse(false, 'Không thể tự xóa chính mình');
}

$stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
if ($stmt->execute([$user_id])) {
    sendResponse(true, 'Xóa người dùng thành công');
} else {
    sendResponse(false, 'Không thể xóa người dùng');
} 