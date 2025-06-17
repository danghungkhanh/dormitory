<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

// Chỉ chấp nhận yêu cầu GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Invalid request method.');
}

try {
    $rooms = [];
    $sql = "SELECT r.id, r.room_number, r.capacity, r.current_occupancy, r.status, d.name as dorm_name, rt.name as room_type_name FROM rooms r JOIN dorms d ON r.dorm_id = d.id JOIN room_types rt ON r.room_type_id = rt.id WHERE r.current_occupancy < r.capacity";
    $params = [];

    if (isset($_GET['dorm_id']) && !empty($_GET['dorm_id'])) {
        $sql .= " AND r.dorm_id = :dorm_id";
        $params[':dorm_id'] = sanitizeInput($_GET['dorm_id']);
    }

    if (isset($_GET['room_type']) && !empty($_GET['room_type'])) {
        $sql .= " AND r.room_type_id = :room_type_id";
        $params[':room_type_id'] = sanitizeInput($_GET['room_type']);
    }

    if (isset($_GET['available']) && $_GET['available'] == 'true') {
        // Điều kiện r.current_occupancy < r.capacity đã có trong câu SQL chính
    }

    $sql .= " ORDER BY r.room_number ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(true, 'Danh sách phòng trống', $rooms);

} catch (PDOException $e) {
    sendResponse(false, 'Lỗi truy vấn cơ sở dữ liệu: ' . $e->getMessage());
}
?> 