<?php
require_once '../../includes/config.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json');

// Xác thực token JWT và kiểm tra quyền admin
$user_data = getUserFromToken();
if (!$user_data || !$user_data['is_admin']) {
    sendResponse(false, 'Không có quyền truy cập.', [], 403);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetRegistrations($conn);
        break;
    case 'PUT':
        handleUpdateRegistrationStatus($conn);
        break;
    default:
        sendResponse(false, 'Phương thức không hợp lệ.');
        break;
}

function handleGetRegistrations($conn) {
    $sql = "SELECT dr.id, dr.student_id, dr.full_name, dr.companion_ids, d.name AS dorm_name, rt.name AS room_type_name, r.room_number, dr.check_in_date, dr.duration, dr.notes, dr.agree_terms, dr.registration_date, dr.status FROM dorm_registrations dr JOIN dorms d ON dr.dorm_id = d.id JOIN room_types rt ON dr.room_type_id = rt.id JOIN rooms r ON dr.room_id = r.id ORDER BY dr.registration_date DESC";
    $result = $conn->query($sql);

    if ($result) {
        $registrations = [];
        while ($row = $result->fetch_assoc()) {
            $registrations[] = $row;
        }
        sendResponse(true, 'Lấy danh sách đăng ký nội trú thành công.', $registrations);
    } else {
        sendResponse(false, 'Lỗi khi lấy danh sách đăng ký nội trú: ' . $conn->error);
    }
}

function handleUpdateRegistrationStatus($conn) {
    $input = json_decode(file_get_contents('php://input'), true);

    $registration_id = sanitizeInput($input['id'] ?? '');
    $new_status = sanitizeInput($input['status'] ?? '');
    $room_id = sanitizeInput($input['room_id'] ?? ''); // Cần lấy room_id để cập nhật current_occupancy

    if (empty($registration_id) || empty($new_status) || empty($room_id)) {
        sendResponse(false, 'Thiếu thông tin ID đăng ký, trạng thái hoặc ID phòng.');
    }

    // Lấy trạng thái hiện tại của đăng ký để tránh cập nhật sai
    $sql_get_current_status = "SELECT status, room_id FROM dorm_registrations WHERE id = ?";
    $stmt_get_status = $conn->prepare($sql_get_current_status);
    $stmt_get_status->bind_param("i", $registration_id);
    $stmt_get_status->execute();
    $result_get_status = $stmt_get_status->get_result();
    $current_reg_info = $result_get_status->fetch_assoc();
    $stmt_get_status->close();

    if (!$current_reg_info) {
        sendResponse(false, 'Không tìm thấy đăng ký.');
    }

    $old_status = $current_reg_info['status'];
    $room_id_from_db = $current_reg_info['room_id'];

    // Bắt đầu transaction
    $conn->begin_transaction();

    try {
        // Cập nhật trạng thái đăng ký
        $sql_update_reg = "UPDATE dorm_registrations SET status = ? WHERE id = ?";
        $stmt_update_reg = $conn->prepare($sql_update_reg);
        $stmt_update_reg->bind_param("si", $new_status, $registration_id);
        $stmt_update_reg->execute();
        
        if ($stmt_update_reg->affected_rows === 0) {
            throw new Exception('Không có thay đổi trạng thái hoặc ID đăng ký không tồn tại.');
        }
        $stmt_update_reg->close();

        // Cập nhật current_occupancy trong bảng rooms
        if ($new_status === 'approved' && $old_status !== 'approved') {
            // Tăng số người đang ở khi đăng ký được duyệt
            $sql_update_room = "UPDATE rooms SET current_occupancy = current_occupancy + 1 WHERE id = ?";
            $stmt_update_room = $conn->prepare($sql_update_room);
            $stmt_update_room->bind_param("i", $room_id_from_db);
            $stmt_update_room->execute();
            $stmt_update_room->close();

            // Cập nhật trạng thái phòng nếu đầy
            $sql_check_room_capacity = "SELECT capacity, current_occupancy FROM rooms WHERE id = ?";
            $stmt_check_room = $conn->prepare($sql_check_room_capacity);
            $stmt_check_room->bind_param("i", $room_id_from_db);
            $stmt_check_room->execute();
            $result_check_room = $stmt_check_room->get_result();
            $room_info = $result_check_room->fetch_assoc();
            $stmt_check_room->close();

            if ($room_info && $room_info['current_occupancy'] >= $room_info['capacity']) {
                $sql_set_room_full = "UPDATE rooms SET status = 'full' WHERE id = ?";
                $stmt_set_room_full = $conn->prepare($sql_set_room_full);
                $stmt_set_room_full->bind_param("i", $room_id_from_db);
                $stmt_set_room_full->execute();
                $stmt_set_room_full->close();
            } else if ($room_info && $room_info['current_occupancy'] > 0 && $room_info['current_occupancy'] < $room_info['capacity']) {
                // Nếu có người nhưng chưa đầy, đặt là 'occupied'
                $sql_set_room_occupied = "UPDATE rooms SET status = 'occupied' WHERE id = ?";
                $stmt_set_room_occupied = $conn->prepare($sql_set_room_occupied);
                $stmt_set_room_occupied->bind_param("i", $room_id_from_db);
                $stmt_set_room_occupied->execute();
                $stmt_set_room_occupied->close();
            }

        } else if (($new_status === 'rejected' || $new_status === 'cancelled') && $old_status === 'approved') {
            // Giảm số người đang ở khi đăng ký bị từ chối/hủy và trước đó đã được duyệt
            $sql_update_room = "UPDATE rooms SET current_occupancy = GREATEST(0, current_occupancy - 1) WHERE id = ?";
            $stmt_update_room = $conn->prepare($sql_update_room);
            $stmt_update_room->bind_param("i", $room_id_from_db);
            $stmt_update_room->execute();
            $stmt_update_room->close();

            // Cập nhật trạng thái phòng nếu còn trống
            $sql_check_room_capacity = "SELECT capacity, current_occupancy FROM rooms WHERE id = ?";
            $stmt_check_room = $conn->prepare($sql_check_room_capacity);
            $stmt_check_room->bind_param("i", $room_id_from_db);
            $stmt_check_room->execute();
            $result_check_room = $stmt_check_room->get_result();
            $room_info = $result_check_room->fetch_assoc();
            $stmt_check_room->close();

            if ($room_info && $room_info['current_occupancy'] === 0) {
                $sql_set_room_empty = "UPDATE rooms SET status = 'empty' WHERE id = ?";
                $stmt_set_room_empty = $conn->prepare($sql_set_room_empty);
                $stmt_set_room_empty->bind_param("i", $room_id_from_db);
                $stmt_set_room_empty->execute();
                $stmt_set_room_empty->close();
            } else if ($room_info && $room_info['current_occupancy'] > 0 && $room_info['current_occupancy'] < $room_info['capacity']) {
                // Nếu còn người và chưa đầy, đặt là 'occupied'
                $sql_set_room_occupied = "UPDATE rooms SET status = 'occupied' WHERE id = ?";
                $stmt_set_room_occupied = $conn->prepare($sql_set_room_occupied);
                $stmt_set_room_occupied->bind_param("i", $room_id_from_db);
                $stmt_set_room_occupied->execute();
                $stmt_set_room_occupied->close();
            }
        }

        $conn->commit();
        sendResponse(true, 'Cập nhật trạng thái đăng ký thành công.');
    } catch (Exception $e) {
        $conn->rollback();
        sendResponse(false, 'Lỗi cập nhật trạng thái đăng ký: ' . $e->getMessage());
    }
}

$conn->close();
?> 