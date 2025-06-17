<?php
require_once '../../includes/config.php';
require_once '../../includes/functions.php';

// Verify admin token
$user = getUserFromToken();
if (!$user || ($user['is_admin'] ?? 0) !== 1) {
    sendResponse(false, 'Unauthorized access');
}

// Get all payments with user information
$query = "SELECT 
    p.*,
    u.fullname,
    u.student_id,
    u.email,
    r.room_number,
    CASE 
        WHEN p.payment_type = 'room' THEN 'Tiền phòng'
        WHEN p.payment_type = 'electricity' THEN 'Tiền điện'
        WHEN p.payment_type = 'water' THEN 'Tiền nước'
        ELSE 'Khác'
    END as payment_type_name,
    CASE 
        WHEN p.status = 'pending' THEN 'Chờ thanh toán'
        WHEN p.status = 'paid' THEN 'Đã thanh toán'
        WHEN p.status = 'overdue' THEN 'Quá hạn'
        ELSE 'Khác'
    END as payment_status
FROM payments p
JOIN users u ON p.user_id = u.id
LEFT JOIN rooms r ON p.room_id = r.id
ORDER BY p.created_at DESC";

$stmt = $pdo->prepare($query);
$stmt->execute();
$payments = $stmt->fetchAll();

// Get overdue payments
$query = "SELECT 
    u.id,
    u.fullname,
    u.student_id,
    u.email,
    r.room_number,
    SUM(CASE WHEN p.payment_type = 'room' AND p.status != 'paid' THEN p.amount ELSE 0 END) as room_debt,
    SUM(CASE WHEN p.payment_type = 'electricity' AND p.status != 'paid' THEN p.amount ELSE 0 END) as electricity_debt,
    SUM(CASE WHEN p.payment_type = 'water' AND p.status != 'paid' THEN p.amount ELSE 0 END) as water_debt
FROM users u
LEFT JOIN dorm_registrations dr ON u.student_id = dr.student_id AND dr.status = 'approved'
LEFT JOIN rooms r ON dr.room_id = r.id
LEFT JOIN payments p ON u.id = p.user_id
WHERE p.status != 'paid' OR p.status IS NULL
GROUP BY u.id, u.fullname, u.student_id, u.email, r.room_number
HAVING room_debt > 0 OR electricity_debt > 0 OR water_debt > 0";

$stmt = $pdo->prepare($query);
$stmt->execute();
$debts = $stmt->fetchAll();

sendResponse(true, 'Success', [
    'payments' => $payments,
    'debts' => $debts
]); 