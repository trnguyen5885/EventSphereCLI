// services/authService.js
import {AxiosInstance} from '../services';
import {saveTokens} from '../token/authTokens';

export const loginOrganizer = async (email, password) => {
  const body = { email, password };
  const res = await AxiosInstance().post('users/login', body);

  const { status, data } = res;

  if (status === 200 && data.role === 2) {
    const { id, token, refreshToken, ...rest } = data;
    await saveTokens(token, refreshToken);

    return {
      status: 200,
      data: {
        id,
        token,
        refreshToken,
        role: 2,
        ...rest,
      },
    };
  } else {
    throw new Error('Tài khoản không thuộc nhà tổ chức');
  }
};

export const loginUser = async (email, password) => {
  const body = { email, password };
  const res = await AxiosInstance().post('users/login', body);

  const { status, data } = res;

  if (status === 200 && data.role === 3) {
    const { id, token, refreshToken, ...rest } = data;
    await saveTokens(token, refreshToken);

    return {
      status: 200,
      data: {
        id,
        token,
        refreshToken,
        role: 3,
        ...rest,
      },
    };
  } else {
    throw new Error('Tài khoản không thuộc người dùng thông thường');
  }
};

export const socialLogin = async (idToken) => {
  const body = { idToken };
  const res = await AxiosInstance().post('users/googleLogin', body);

  const { status, data } = res;

  if (status === 200) {
    const { id, token, refreshToken, role, ...rest } = data;
    await saveTokens(token, refreshToken);

    return {
      status: 200,
      data: {
        id,
        token,
        refreshToken,
        role,
        ...rest,
      },
    };
  } else {
    throw new Error('Đăng nhập xã hội thất bại');
  }
};


