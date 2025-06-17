<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../../includes/config.php';
require_once '../../includes/functions.php';
require_once '../../includes/database.php';

// Xử lý yêu cầu OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Xác thực token admin
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if (!$token) {
    echo json_encode(['success' => false, 'message' => 'Token không hợp lệ']);
    exit();
}

$decoded = verifyToken($token);
if (!$decoded || !isset($decoded['is_admin']) || $decoded['is_admin'] != 1) {
    echo json_encode(['success' => false, 'message' => 'Không có quyền truy cập']);
    exit();
}

$database = new Database();
$db = $database->getConnection();

// Xử lý yêu cầu GET để lấy danh sách người dùng
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Lấy tổng số người dùng
        $countQuery = "SELECT COUNT(*) as total FROM users WHERE is_admin = 0";
        $countStmt = $db->prepare($countQuery);
        $countStmt->execute();
        $totalUsers = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Lấy tất cả người dùng
        $query = "SELECT id, student_id, fullname, email, phone, gender, dob, address FROM users WHERE is_admin = 0 ORDER BY fullname";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'users' => $users
            ]
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Lỗi khi lấy dữ liệu người dùng']);
    }
}

// Xử lý yêu cầu POST để thêm người dùng mới
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['student_id']) || !isset($data['fullname']) || !isset($data['email']) || !isset($data['password'])) {
        echo json_encode(['success' => false, 'message' => 'Thiếu thông tin cần thiết']);
        exit();
    }

    try {
        // Kiểm tra xem mã sinh viên đã tồn tại chưa
        $checkQuery = "SELECT id FROM users WHERE student_id = :student_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':student_id', $data['student_id']);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Mã sinh viên đã tồn tại']);
            exit();
        }

        // Kiểm tra email đã tồn tại chưa
        $checkEmailQuery = "SELECT id FROM users WHERE email = :email";
        $checkEmailStmt = $db->prepare($checkEmailQuery);
        $checkEmailStmt->bindParam(':email', $data['email']);
        $checkEmailStmt->execute();

        if ($checkEmailStmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Email đã tồn tại']);
            exit();
        }

        // Thêm người dùng mới
        $query = "INSERT INTO users (student_id, fullname, email, password, phone, gender, dob, address) 
                 VALUES (:student_id, :fullname, :email, :password, :phone, :gender, :dob, :address)";
        
        $stmt = $db->prepare($query);
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $stmt->bindParam(':student_id', $data['student_id']);
        $stmt->bindParam(':fullname', $data['fullname']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':phone', $data['phone'] ?? null);
        $stmt->bindParam(':gender', $data['gender'] ?? null);
        $stmt->bindParam(':dob', $data['dob'] ?? null);
        $stmt->bindParam(':address', $data['address'] ?? null);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Thêm người dùng thành công']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Không thể thêm người dùng']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Lỗi khi thêm người dùng']);
    }
}

// Xử lý yêu cầu PUT để cập nhật thông tin người dùng
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id']) || !isset($data['student_id']) || !isset($data['fullname']) || !isset($data['phone'])) {
        echo json_encode(['success' => false, 'message' => 'Thiếu thông tin cần thiết']);
        exit();
    }

    try {
        // Kiểm tra xem mã sinh viên đã tồn tại cho người dùng khác chưa
        $checkQuery = "SELECT id FROM users WHERE student_id = :student_id AND id != :user_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':student_id', $data['student_id']);
        $checkStmt->bindParam(':user_id', $data['user_id']);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            echo json_encode(['success' => false, 'message' => 'Mã sinh viên đã tồn tại']);
            exit();
        }

        // Cập nhật thông tin người dùng
        $query = "UPDATE users SET 
                  student_id = :student_id,
                  fullname = :fullname,
                  phone = :phone,
                  gender = :gender,
                  dob = :dob,
                  address = :address
                  WHERE id = :user_id AND is_admin = 0";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':student_id', $data['student_id']);
        $stmt->bindParam(':fullname', $data['fullname']);
        $stmt->bindParam(':phone', $data['phone']);
        $stmt->bindParam(':gender', $data['gender'] ?? null);
        $stmt->bindParam(':dob', $data['dob'] ?? null);
        $stmt->bindParam(':address', $data['address'] ?? null);
        $stmt->bindParam(':user_id', $data['user_id']);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Cập nhật thông tin thành công']);
} else {
            echo json_encode(['success' => false, 'message' => 'Không thể cập nhật thông tin']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Lỗi khi cập nhật thông tin']);
    }
}

// Xử lý phương thức không hợp lệ
else {
    echo json_encode(['success' => false, 'message' => 'Phương thức không hợp lệ']);
} 