import axios from 'axios';
import { PAYOS_CONFIG } from './payosConfig';

const checkPaymentStatus = async (orderCode) => {
  const { clientID, apiKey } = PAYOS_CONFIG;

  try {
    const res = await axios.get(
      `https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`,
      {
        headers: {
          'x-client-id': clientID,
          'x-api-key': apiKey,
        },
      }
    );

    if (res.data.code === '00') {
      const status = res.data.data.status; // PAID, PENDING, CANCELED
      return { status, fullResponse: res.data.data };
    } else {
      console.log('❌ Lỗi phản hồi:', res.data);
      return { status: null, fullResponse: null };
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error);
    return { status: null, fullResponse: null };
  }
};

export default checkPaymentStatus;
