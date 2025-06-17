<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

// Chỉ chấp nhận yêu cầu GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Invalid request method.');
}

try {
    $dorms = [];
    $sql = "SELECT id, name, address, total_rooms FROM dorms ORDER BY name ASC";
    
    $stmt = $pdo->query($sql);
    $dorms = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(true, 'Danh sách ký túc xá', $dorms);

} catch (PDOException $e) {
    sendResponse(false, 'Lỗi truy vấn cơ sở dữ liệu: ' . $e->getMessage());
}
?> 