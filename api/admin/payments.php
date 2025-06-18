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
    (CASE WHEN dr.status = 'approved' THEN (rt.price * dr.duration - dr.paid_amount) ELSE 0 END) as room_debt,
    SUM(GREATEST(
        COALESCE(ur.electricity_kwh, 0) * 1000 - COALESCE(
            (SELECT SUM(amount) FROM payments p1 WHERE p1.user_id = u.id AND p1.room_id = ur.room_id AND p1.payment_type = 'electricity' AND YEAR(p1.payment_date) = ur.year AND MONTH(p1.payment_date) = ur.month AND p1.status = 'paid'),
        0), 0)) as electricity_debt,
    SUM(GREATEST(
        COALESCE(ur.water_m3, 0) * 2000 - COALESCE(
            (SELECT SUM(amount) FROM payments p2 WHERE p2.user_id = u.id AND p2.room_id = ur.room_id AND p2.payment_type = 'water' AND YEAR(p2.payment_date) = ur.year AND MONTH(p2.payment_date) = ur.month AND p2.status = 'paid'),
        0), 0)) as water_debt
FROM users u
LEFT JOIN dorm_registrations dr ON u.student_id = dr.student_id AND dr.status = 'approved'
LEFT JOIN rooms r ON dr.room_id = r.id
LEFT JOIN room_types rt ON dr.room_type_id = rt.id
LEFT JOIN utility_readings ur ON u.student_id = ur.student_id
GROUP BY u.id, u.fullname, u.student_id, u.email, r.room_number, dr.id, dr.paid_amount, dr.duration, rt.price, dr.status
HAVING room_debt > 0 OR electricity_debt > 0 OR water_debt > 0";

$stmt = $pdo->prepare($query);
$stmt->execute();
$debts = $stmt->fetchAll();

sendResponse(true, 'Success', [
    'payments' => $payments,
    'debts' => $debts
]); 