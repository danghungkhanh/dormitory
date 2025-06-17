import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PaymentRoom() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // State for dialog
  const [paymentDetails, setPaymentDetails] = useState(null); // State for payment details in dialog
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost/project3/api/payment-room.php', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setRegistrations(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError('Lỗi khi tải dữ liệu đăng ký phòng. Vui lòng thử lại.');
        console.error('Error fetching registrations:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (reg, percentage) => {
    // Calculate the amount to pay based on remaining balance
    const amountToPay = (reg.remaining_balance * percentage / 100);

    if (amountToPay <= 0 && reg.remaining_balance <= 0) {
        setError('Bạn đã thanh toán đầy đủ cho đăng ký này.');
        return;
    }
    if (amountToPay <= 0) {
        setError('Số tiền thanh toán phải lớn hơn 0.');
        return;
    }

    setPaymentDetails({
      registrationId: reg.registration_id,
      roomNumber: reg.room_number,
      dormName: reg.dorm_name,
      roomTypeName: reg.room_type_name,
      totalCost: reg.total_cost,
      paidAmount: reg.paid_amount,
      remainingBalance: reg.remaining_balance,
      percentage: percentage,
      amountToPay: amountToPay,
      studentId: reg.student_id,
    });
    setShowConfirmDialog(true);
  };

  const confirmPayment = async () => {
    setShowConfirmDialog(false); // Close dialog
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.post('http://localhost/project3/api/payment-room.php', {
        student_id: paymentDetails.studentId,
        amount: paymentDetails.amountToPay,
        payment_method: 'bank_transfer'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccessMessage(`Thanh toán ${paymentDetails.percentage}% thành công! ${response.data.message}`);
        fetchRegistrations(); // Refresh registrations after successful payment
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError('Lỗi khi xử lý thanh toán. Vui lòng thử lại.');
        console.error('Error processing payment:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelPayment = () => {
    setShowConfirmDialog(false);
    setPaymentDetails(null);
  };

  if (loading) {
    return <div className="text-center mt-5">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="payment-container">
      <h2 className="payment-title">Thanh toán tiền phòng</h2>
      {error && <div className="payment-alert error" role="alert">{error}</div>}
      {successMessage && <div className="payment-alert success" role="alert">{successMessage}</div>}

      <h3 className="section-title">Đăng ký phòng của bạn</h3>
      {registrations.length === 0 ? (
        <p>Bạn chưa có đăng ký phòng nào.</p>
      ) : (
        <div className="registration-grid">
          {registrations.map((reg) => (
            <div key={reg.registration_id} className="registration-card">
              <div className="card-section">
                <h4 className="section-title">Thông tin phòng</h4>
                <p><strong>Phòng:</strong> {reg.room_number} - {reg.dorm_name}</p>
                <p><strong>Loại phòng:</strong> {reg.room_type_name}</p>
                <p><strong>Ngày nhận phòng:</strong> {reg.check_in_date}</p>
                <p><strong>Thời gian ở:</strong> {reg.duration} tháng</p>
              </div>

              <div className="card-section">
                <h4 className="section-title">Thông tin thanh toán</h4>
                <p><strong>Tổng chi phí:</strong> {parseFloat(reg.total_cost).toLocaleString('vi-VN')} VNĐ</p>
                <p><strong>Đã thanh toán:</strong> <span className="highlight-text" style={{ color: '#28a745' }}>{parseFloat(reg.paid_amount).toLocaleString('vi-VN')} VNĐ</span></p>
                <p><strong>Còn lại:</strong> <span className="highlight-text" style={{ color: '#dc3545' }}>{parseFloat(reg.remaining_balance).toLocaleString('vi-VN')} VNĐ</span></p>
              </div>

              {parseFloat(reg.remaining_balance).toFixed(2) > 0 && (
                <div className="card-section">
                  <h4 className="section-title">Thanh toán:</h4>
                  <div className="payment-button-group">
                    {[30, 50, 70, 100].map(percentage => (
                      <button
                        key={percentage}
                        onClick={() => handlePayment(reg, percentage)}
                        className="payment-button"
                        disabled={loading}
                      >
                        Trả {percentage}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {parseFloat(reg.remaining_balance).toFixed(2) <= 0 && (
                <p className="full-payment-message">Bạn đã thanh toán đầy đủ cho đăng ký này.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Section */}
      {showConfirmDialog && paymentDetails && (
        <div className="confirmation-dialog">
          <h3 className="confirmation-title">Xác nhận thanh toán</h3>
          <p className="confirmation-text">Bạn có chắc chắn muốn thanh toán <span className="highlight-text">{paymentDetails.percentage}%</span> (Tổng: <span className="highlight-text">{parseFloat(paymentDetails.amountToPay).toLocaleString('vi-VN')} VNĐ</span>) cho phòng <span className="highlight-text">{paymentDetails.roomNumber} - {paymentDetails.dormName}</span>?</p>
          <p className="confirmation-text">Số dư còn lại sau thanh toán: <span className="highlight-text" style={{ color: '#dc3545' }}>{parseFloat(paymentDetails.remainingBalance - paymentDetails.amountToPay).toLocaleString('vi-VN')} VNĐ</span></p>
          <div className="dialog-buttons">
            <button
              onClick={cancelPayment}
              className="dialog-button cancel"
            >
              Hủy
            </button>
            <button
              onClick={confirmPayment}
              className="dialog-button confirm"
            >
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 