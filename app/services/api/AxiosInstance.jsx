import { appInfo } from "../../../app/constants/appInfos";
import { deleteTokens, getTokens, saveTokens } from "../../token/authTokens";
import axios from "axios";

const AxiosInstance = (contentType = 'application/json') => {
    const axiosInstance = axios.create({
        baseURL: appInfo.BASE_URL,
    });

    // Request Interceptor
    axiosInstance.interceptors.request.use(
        async (config) => {
            const tokens = await getTokens();
            if (tokens?.accessToken) {
                config.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
            }
            config.headers['Content-Type'] = contentType;
            config.headers['Accept'] = 'application/json';
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response Interceptor
    axiosInstance.interceptors.response.use(
        (response) => response.data,
        async (error) => {
            const originalRequest = error.config;

            if ((error.response?.status === 401) && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const tokens = await getTokens();
                    console.log("Refresh Token:", tokens?.refreshToken);

                    const body = {
                        refreshToken: tokens?.refreshToken,
                    };

                    const res = await axios.post(`${appInfo.BASE_URL}/users/refresh-token`, body);
                    const newAccessToken = res.token;
                    await saveTokens(newAccessToken, tokens.refreshToken);

                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // ✅ Use default axios to resend the request, not axiosInstance
                    return axios(originalRequest);
                } catch (refreshErr) {
                    await deleteTokens();
                    return Promise.reject(refreshErr);
                }
            }

            return Promise.reject(error);
        }
    );

    return axiosInstance;
};

export default AxiosInstance;
