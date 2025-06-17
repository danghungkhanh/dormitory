<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['fullname', 'email', 'password', 'student_id', 'phone'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        sendResponse(false, ucfirst($field) . ' is required');
    }
}

// Validate email format
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid email format');
}

// Validate password length
if (strlen($data['password']) < 6) {
    sendResponse(false, 'Password must be at least 6 characters long');
}

try {
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        sendResponse(false, 'Email already exists');
    }

    // Check if student ID already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE student_id = ?");
    $stmt->execute([$data['student_id']]);
    if ($stmt->fetch()) {
        sendResponse(false, 'Student ID already exists');
    }

    // Hash password
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO users (fullname, email, password, student_id, phone, is_admin) VALUES (?, ?, ?, ?, ?, 0)");
    $stmt->execute([
        $data['fullname'],
        $data['email'],
        $hashed_password,
        $data['student_id'],
        $data['phone']
    ]);

    // Get the new user's ID
    $user_id = $pdo->lastInsertId();

    // Generate token
    $token = generateToken([
        'id' => $user_id,
        'email' => $data['email'],
        'is_admin' => 0 // New users are not admin by default
    ]);

    sendResponse(true, 'Registration successful', [
        'token' => $token,
        'user' => [
            'id' => $user_id,
            'fullname' => $data['fullname'],
            'email' => $data['email'],
            'student_id' => $data['student_id'],
            'phone' => $data['phone'],
            'is_admin' => 0
        ]
    ]);

} catch (PDOException $e) {
    sendResponse(false, 'Registration failed: ' . $e->getMessage());
} 