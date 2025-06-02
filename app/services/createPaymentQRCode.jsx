import axios from 'axios';
import CryptoJS from 'crypto-js';
import { PAYOS_CONFIG } from './payosConfig';

const createPaymentQRCode = async (amount, description) => {
  const { clientID, apiKey, checkSum } = PAYOS_CONFIG;

  const MAX_DESCRIPTION_LENGTH = 25;
  description = description.substring(0, MAX_DESCRIPTION_LENGTH);


  const orderCode = Date.now();
  const returnUrl = 'https://localhost:3000/success';
  const cancelUrl = 'https://localhost:3000/cancel';

  const rawData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
  const signature = CryptoJS.HmacSHA256(rawData, checkSum).toString(CryptoJS.enc.Hex);

  const body = {
    orderCode,
    amount,
    description,
    cancelUrl,
    returnUrl,
    signature,
  };

  try {
    const res = await axios.post(
      'https://api-merchant.payos.vn/v2/payment-requests',
      body,
      {
        headers: {
          'x-client-id': clientID,
          'x-api-key': apiKey,
        },
      }
    );

    console.log('🔁 PAYOS response:', res.data);

    if (res.data.code === '00') {
      const data = res.data.data;
      console.log('✅ PAYOS data object:', data);

      // kiểm tra từng field
      const qrImage = data.qrCode || data.qrCodeUrl || null;
      const deepLink = data.deeplink || null;

      return {
        qrImage: data.qrData || data.qrCode, // chuỗi QR
        deepLink: data.deeplink,
        orderCode: data.orderCode,
      };

    }

  } catch (error) {
    console.error('❌ Lỗi gọi API:', error);
    return null;
  }
};

export default createPaymentQRCode;
