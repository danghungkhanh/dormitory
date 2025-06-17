import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoomManagement from './RoomManagement';
import UserManagement from './UserManagement';
import DormRegistrationManagement from './DormRegistrationManagement';
import UtilityReadingManagement from './UtilityReadingManagement';
import Payments from './Payments';

export default function AdminDashboard() {
  return (
    <Routes>
      <Route path="/rooms" element={<RoomManagement />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/dorm-registrations" element={<DormRegistrationManagement />} />
      <Route path="/utility-readings" element={<UtilityReadingManagement />} />
      <Route path="/payments" element={<Payments />} />
      {/* Thêm các route admin khác ở đây */}
      <Route path="/*" element={<div>Vui lòng chọn một chức năng quản trị từ menu.</div>} />
    </Routes>
  );
} 