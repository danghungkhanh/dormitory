import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PaymentElectricity() {
  const [electricityData, setElectricityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchElectricityBill();
  }, []);

  const fetchElectricityBill = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get(`http://localhost/project3/api/payment-electricity.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setElectricityData(response.data.data);
      } else {
        setError(response.data.message);
        setElectricityData(null);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError('Lỗi khi tải hóa đơn tiền điện. Vui lòng thử lại.');
        console.error('Error fetching electricity bill:', err);
        setElectricityData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (amount) => {
    setPaymentDetails({
      amount: amount,
      month: electricityData.month,
      year: electricityData.year,
    });
    setShowConfirmDialog(true);
  };

  const confirmPayment = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.post('http://localhost/project3/api/payment-electricity.php', {
        room_id: electricityData.room_id,
        month: paymentDetails.month,
        year: paymentDetails.year,
        amount: paymentDetails.amount,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccessMessage(`Thanh toán tiền điện thành công!`);
        fetchElectricityBill();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError('Lỗi khi xử lý thanh toán tiền điện. Vui lòng thử lại.');
        console.error('Error processing electricity payment:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelPayment = () => {
    setShowConfirmDialog(false);
    setPaymentDetails(null);
  };

  return (
    <div className="payment-container">
      <h2 className="payment-title">Thanh toán tiền điện</h2>
      {error && <div className="payment-alert error" role="alert">{error}</div>}
      {successMessage && <div className="payment-alert success" role="alert">{successMessage}</div>}

      {loading ? (
        <div className="text-center">Đang tải dữ liệu...</div>
      ) : electricityData ? (
        <div className="registration-card">
          <div className="card-section">
            <h4 className="section-title">Thông tin sử dụng ({electricityData.month}/{electricityData.year})</h4>
            <p><strong>Điện:</strong> {electricityData.electricity_kwh} kWh</p>
          </div>

          <div className="card-section">
            <h4 className="section-title">Chi phí điện</h4>
            <p><strong>Số tiền:</strong> {parseFloat(electricityData.electricity_cost).toLocaleString('vi-VN')} VNĐ</p>
            <p><strong>Trạng thái:</strong> 
              <span style={{ color: electricityData.electricity_paid ? 'green' : 'red' }}>
                {electricityData.electricity_paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </p>
            {!electricityData.electricity_paid && electricityData.electricity_cost > 0 && (
              <button
                onClick={() => handlePayment(electricityData.electricity_cost)}
                className="payment-button"
              >
                Thanh toán tiền điện
              </button>
            )}
            {electricityData.electricity_cost === 0 && (<p>Không có hóa đơn điện.</p>)}
            {electricityData.electricity_paid && (<p>Hóa đơn điện tháng này đã thanh toán.</p>)}
          </div>

        </div>
      ) : (
        <p>Không tìm thấy dữ liệu sử dụng điện cho phòng này hoặc hóa đơn đã thanh toán.</p>
      )}

      {showConfirmDialog && paymentDetails && (
        <div className="confirmation-dialog">
          <h3 className="confirmation-title">Xác nhận thanh toán</h3>
          <p className="confirmation-text">
            Bạn có chắc chắn muốn thanh toán 
            <span className="highlight-text">{parseFloat(paymentDetails.amount).toLocaleString('vi-VN')} VNĐ</span> 
            cho tiền điện 
            tháng <span className="highlight-text">{paymentDetails.month}/{paymentDetails.year}</span>?
          </p>
          <div className="dialog-buttons">
            <button onClick={cancelPayment} className="dialog-button cancel">Hủy</button>
            <button onClick={confirmPayment} className="dialog-button confirm">Xác nhận thanh toán</button>
          </div>
        </div>
      )}
    </div>
  );
} 