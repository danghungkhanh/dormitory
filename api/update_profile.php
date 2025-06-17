<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

// Chỉ chấp nhận yêu cầu POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method.');
}

// Xác thực token JWT
$user_data = getUserFromToken();
if (!$user_data) {
    sendResponse(false, 'Unauthorized access.', [], 401);
}

// Lấy dữ liệu JSON từ request body
$input = json_decode(file_get_contents('php://input'), true);

// Kiểm tra các trường bắt buộc
if (!isset($input['student_id']) || !isset($input['fullname'])) {
    sendResponse(false, 'Mã số sinh viên và họ tên là bắt buộc.');
}

// Sanitize input
$student_id = sanitizeInput($input['student_id']);
$fullname = sanitizeInput($input['fullname']);
$phone = sanitizeInput($input['phone'] ?? '');
$address = sanitizeInput($input['address'] ?? '');
$gender = sanitizeInput($input['gender'] ?? '');
$dob = sanitizeInput($input['dob'] ?? '');

// Kiểm tra định dạng mã số sinh viên
if (!validateStudentId($student_id)) {
    sendResponse(false, 'Mã số sinh viên không hợp lệ. Vui lòng nhập 10 chữ số.');
}

// Kiểm tra định dạng số điện thoại nếu có
if ($phone && !validatePhone($phone)) {
    sendResponse(false, 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số.');
}

// Cập nhật thông tin người dùng
$sql = "UPDATE users SET student_id = ?, fullname = ?, phone = ?, address = ?, gender = ?, dob = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssi", $student_id, $fullname, $phone, $address, $gender, $dob, $user_data['user_id']);

if ($stmt->execute()) {
    // Lấy thông tin người dùng mới
    $sql = "SELECT * FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_data['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    // Tạo token mới với thông tin đã cập nhật
    $token = generateToken($user);
    
    // Xóa mật khẩu khỏi dữ liệu người dùng
    unset($user['password']);
    
    sendResponse(true, 'Cập nhật thông tin thành công', [
        'token' => $token,
        'user' => $user
    ]);
} else {
    sendResponse(false, 'Cập nhật thông tin thất bại: ' . $stmt->error);
}

$stmt->close();
$conn->close();
?> 