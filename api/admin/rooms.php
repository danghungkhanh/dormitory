<?php
require_once '../../includes/config.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

// Chỉ chấp nhận yêu cầu GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Phương thức không hợp lệ.');
}

// Xác thực token JWT và kiểm tra quyền admin
$user_data = getUserFromToken();
if (!$user_data || ($user_data['is_admin'] ?? 0) !== 1) {
    sendResponse(false, 'Không có quyền truy cập.', [], 403);
}

try {
    $response_data = [];

    // Lấy tổng số phòng
    $sql_total_rooms = "SELECT COUNT(*) AS total_rooms FROM rooms";
    $stmt_total_rooms = $pdo->query($sql_total_rooms);
    $response_data['total_rooms'] = (int)$stmt_total_rooms->fetchColumn();

    // Lấy tổng số sinh viên đang ở
    $sql_total_students = "
        SELECT COUNT(DISTINCT dr.student_id) AS total_students 
        FROM dorm_registrations dr
    ";
    $stmt_total_students = $pdo->query($sql_total_students);
    $response_data['total_students'] = (int)$stmt_total_students->fetchColumn();

    // Lấy số phòng còn trống
    $sql_available_rooms = "
        SELECT COUNT(*) AS available_rooms 
        FROM rooms r 
        WHERE r.current_occupancy < r.capacity
    ";
    $stmt_available_rooms = $pdo->query($sql_available_rooms);
    $response_data['available_rooms'] = (int)$stmt_available_rooms->fetchColumn();

    // Lấy chi tiết từng phòng và thông tin người dùng đang ở
    $sql_rooms = "
        SELECT 
            r.id AS room_id,
            r.room_number,
            r.capacity,
            r.current_occupancy,
            r.status,
            d.name AS dorm_name,
            rt.name AS room_type_name,
            rt.price
        FROM rooms r
        JOIN dorms d ON r.dorm_id = d.id
        JOIN room_types rt ON r.room_type_id = rt.id
        ORDER BY d.name, r.room_number
    ";

    $stmt_rooms = $pdo->query($sql_rooms);

    $rooms = [];
    while ($room = $stmt_rooms->fetch(PDO::FETCH_ASSOC)) {
        $room_id = $room['room_id'];
        $room['occupants'] = [];

        // Lấy thông tin người dùng đang ở trong phòng
        $sql_occupants = "
            SELECT 
                u.student_id,
                u.fullname,
                u.email,
                u.phone
            FROM dorm_registrations dr
            JOIN users u ON dr.student_id = u.student_id
            WHERE dr.room_id = ?
        ";
        $stmt_occupants = $pdo->prepare($sql_occupants);
        $stmt_occupants->execute([$room_id]);
        while ($occupant = $stmt_occupants->fetch(PDO::FETCH_ASSOC)) {
            $room['occupants'][] = $occupant;
        }
        $rooms[] = $room;
    }
    $response_data['rooms'] = $rooms;
    sendResponse(true, 'Lấy dữ liệu phòng thành công.', $response_data);

} catch (PDOException $e) {
    sendResponse(false, 'Lỗi truy vấn cơ sở dữ liệu: ' . $e->getMessage());
}
?> 