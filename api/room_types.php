<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

// Chỉ chấp nhận yêu cầu GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Invalid request method.');
}

try {
    $room_types = [];
    $sql = "SELECT id, name, capacity, area, price, description FROM room_types";
    $params = [];

    // Nếu có dorm_id được cung cấp, lọc theo dorm_id
    if (isset($_GET['dorm_id']) && !empty($_GET['dorm_id'])) {
        $dorm_id = sanitizeInput($_GET['dorm_id']);
        // Thêm điều kiện JOIN và WHERE nếu bạn có bảng liên kết giữa room_types và rooms/dorm_id
        // Ví dụ: SELECT rt.id, rt.name FROM room_types rt JOIN rooms r ON rt.id = r.room_type_id WHERE r.dorm_id = :dorm_id GROUP BY rt.id
        // Hiện tại, tôi sẽ không thêm JOIN phức tạp, chỉ lấy tất cả các loại phòng.
        // Nếu bạn muốn lọc theo dorm_id, bạn cần cấu trúc lại query và có một mối quan hệ rõ ràng trong DB.
    }

    $stmt = $pdo->query($sql);
    $room_types = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(true, 'Danh sách loại phòng', $room_types);

} catch (PDOException $e) {
    sendResponse(false, 'Lỗi truy vấn cơ sở dữ liệu: ' . $e->getMessage());
}
?> 