<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['email']) || !isset($data['password'])) {
    sendResponse(false, 'Email và mật khẩu là bắt buộc');
}

$email = sanitizeInput($data['email']);
$password = $data['password'];

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Email không hợp lệ');
}

// Get user from database, explicitly select is_admin
$stmt = $pdo->prepare("SELECT id, fullname, email, student_id, phone, password, is_admin FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    sendResponse(false, 'Email không tồn tại');
}

// Verify password
if (!verifyPassword($password, $user['password'])) {
    sendResponse(false, 'Mật khẩu không đúng');
}

// Generate token
$token = generateToken($user);

// Remove sensitive data before sending user info
unset($user['password']);

// Send response
sendResponse(true, 'Đăng nhập thành công', [
    'token' => $token,
    'user' => $user
]);