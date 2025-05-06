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


