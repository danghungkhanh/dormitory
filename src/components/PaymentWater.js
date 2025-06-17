import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PaymentWater() {
  // const [month, setMonth] = useState(new Date().getMonth() + 1); // Bỏ chọn tháng năm
  // const [year, setYear] = useState(new Date().getFullYear()); // Bỏ chọn tháng năm
  const [waterData, setWaterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWaterBill();
  }, []); // Không còn phụ thuộc vào month, year nữa

  const fetchWaterBill = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      // Gọi API mà không truyền tháng và năm
      const response = await axios.get(`http://localhost/project3/api/payment-water.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setWaterData(response.data.data);
      } else {
        setError(response.data.message);
        setWaterData(null);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError('Lỗi khi tải hóa đơn tiền nước. Vui lòng thử lại.');
        console.error('Error fetching water bill:', err);
        setWaterData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (amount) => {
    setPaymentDetails({
      amount: amount,
      month: waterData.month, // Lấy tháng từ dữ liệu hóa đơn
      year: waterData.year,   // Lấy năm từ dữ liệu hóa đơn
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
      const response = await axios.post('http://localhost/project3/api/payment-water.php', {
        room_id: waterData.room_id,
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
        setSuccessMessage(`Thanh toán tiền nước thành công!`);
        fetchWaterBill(); // Refresh data
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError('Lỗi khi xử lý thanh toán tiền nước. Vui lòng thử lại.');
        console.error('Error processing water payment:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelPayment = () => {
    setShowConfirmDialog(false);
    setPaymentDetails(null);
  };

  // Không còn cần các mảng years và months
  // const currentYear = new Date().getFullYear();
  // const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  // const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="payment-container">
      <h2 className="payment-title">Thanh toán tiền nước</h2>
      {error && <div className="payment-alert error" role="alert">{error}</div>}
      {successMessage && <div className="payment-alert success" role="alert">{successMessage}</div>}

      {/* Xóa phần chọn tháng/năm */}
      {/*
      <div className="card-section">
        <h4 className="section-title">Chọn tháng/năm</h4>
        <div className="flex-group">
          <label htmlFor="month-select">Tháng:</label>
          <select
            id="month-select"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="select-field"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <label htmlFor="year-select">Năm:</label>
          <select
            id="year-select"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="select-field"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      */}

      {loading ? (
        <div className="text-center">Đang tải dữ liệu...</div>
      ) : waterData ? (
        <div className="registration-card">
          <div className="card-section">
            <h4 className="section-title">Thông tin sử dụng ({waterData.month}/{waterData.year})</h4>
            <p><strong>Nước:</strong> {waterData.water_m3} m³</p>
          </div>

          <div className="card-section">
            <h4 className="section-title">Chi phí nước</h4>
            <p><strong>Số tiền:</strong> {parseFloat(waterData.water_cost).toLocaleString('vi-VN')} VNĐ</p>
            <p><strong>Trạng thái:</strong> 
              <span style={{ color: waterData.water_paid ? 'green' : 'red' }}>
                {waterData.water_paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </p>
            {!waterData.water_paid && waterData.water_cost > 0 && (
              <button
                onClick={() => handlePayment(waterData.water_cost)}
                className="payment-button"
              >
                Thanh toán tiền nước
              </button>
            )}
            {waterData.water_cost === 0 && (<p>Không có hóa đơn nước.</p>)}
            {waterData.water_paid && (<p>Hóa đơn nước tháng này đã thanh toán.</p>)}
          </div>

        </div>
      ) : (
        <p>Không tìm thấy dữ liệu sử dụng nước cho phòng này hoặc hóa đơn đã thanh toán.</p>
      )}

      {showConfirmDialog && paymentDetails && (
        <div className="confirmation-dialog">
          <h3 className="confirmation-title">Xác nhận thanh toán</h3>
          <p className="confirmation-text">
            Bạn có chắc chắn muốn thanh toán 
            <span className="highlight-text">{parseFloat(paymentDetails.amount).toLocaleString('vi-VN')} VNĐ</span> 
            cho tiền nước 
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