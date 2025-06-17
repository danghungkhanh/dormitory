<?php
require_once(__DIR__ . '/../vendor/autoload.php');
use \Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Function to generate JWT token
function generateToken($user) {
    $issuedAt = time();
    $expirationTime = $issuedAt + 60 * 60 * 24; // 24 hours

    $payload = array(
        'user_id' => $user['id'],
        'email' => $user['email'],
        'student_id' => $user['student_id'] ?? null,
        'fullname' => $user['fullname'] ?? null,
        'is_admin' => $user['is_admin'] ?? 0, // Revert to is_admin
        'iat' => $issuedAt,
        'exp' => $expirationTime
    );

    return JWT::encode($payload, JWT_SECRET, 'HS256');
}

// Function to verify JWT token
function verifyToken($token) {
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
        return (array) $decoded;
    } catch (Exception $e) {
        return false;
    }
}

// Function to get user from token
function getUserFromToken() {
    // Fallback for getallheaders() if it's not defined (e.g., in some SAPI or older PHP versions)
    if (!function_exists('getallheaders')) {
        function getallheaders() {
            $headers = [];
            foreach ($_SERVER as $name => $value) {
                if (substr($name, 0, 5) == 'HTTP_') {
                    $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
                }
            }
            return $headers;
        }
    }

    $headers = getallheaders();

    $authHeader = null;
    foreach ($headers as $key => $value) {
        if (strtolower($key) === 'authorization') {
            $authHeader = $value;
            break;
        }
    }

    if (!$authHeader) {
        return false;
    }

    $token = str_replace('Bearer ', '', $authHeader);
    
    $decodedUser = verifyToken($token);

    return $decodedUser;
}

// Function to check if user is admin
function isAdmin() {
    $user = getUserFromToken();
    return $user && ($user['is_admin'] ?? 0) == 1;
}

// Function to sanitize input
function sanitizeInput($data) {
    // With PDO and prepared statements, explicit sanitization like real_escape_string
    // is generally not needed for SQL queries, as values are properly escaped/quoted.
    // However, for displaying data, htmlspecialchars is still useful.
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Function to send JSON response
function sendResponse($success, $message, $data = null) {
    $response = array(
        'success' => $success,
        'message' => $message
    );

    if ($data !== null) {
        $response['data'] = $data;
    }

    echo json_encode($response);
    exit();
}

// Function to validate email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to validate phone number
function validatePhone($phone) {
    return preg_match('/^[0-9]{10}$/', $phone);
}

// Function to validate student ID
function validateStudentId($studentId) {
    return preg_match('/^[0-9]{10}$/', $studentId);
}

// Function to hash password
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Function to verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Function to generate random string
function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $randomString;
}

// Function to format currency
function formatCurrency($amount) {
    return number_format($amount, 0, ',', '.') . ' VNĐ';
}

// Function to format date
function formatDate($date) {
    return date('d/m/Y', strtotime($date));
}

// Function to format datetime
function formatDateTime($datetime) {
    return date('d/m/Y H:i', strtotime($datetime));
} 