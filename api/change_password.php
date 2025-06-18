<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method.');
}

$user = getUserFromToken();
if (!$user) {
    sendResponse(false, 'Unauthorized.', null);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['old_password']) || !isset($data['new_password'])) {
    sendResponse(false, 'Thiếu thông tin bắt buộc.');
}

$old_password = $data['old_password'];
$new_password = $data['new_password'];

// Lấy thông tin user từ DB
$stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
$stmt->execute([$user['user_id']]);
$row = $stmt->fetch();
if (!$row) {
    sendResponse(false, 'Không tìm thấy người dùng.');
}

if (!verifyPassword($old_password, $row['password'])) {
    sendResponse(false, 'Mật khẩu cũ không đúng.');
}

$hashed_new = password_hash($new_password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
if ($stmt->execute([$hashed_new, $user['user_id']])) {
    sendResponse(true, 'Đổi mật khẩu thành công!');
} else {
    sendResponse(false, 'Không thể đổi mật khẩu.');
} 