import { appInfo } from "@/app/constants/appInfos";
import { deleteTokens, getTokens, saveTokens } from "@/app/token/authTokens";
import axios from "axios";

const AxiosInstance = (contentType = 'application/json') => {
    const axiosInstance = axios.create({
        baseURL: appInfo.BASE_URL
    });

    axiosInstance.interceptors.request.use(
        async (config) => {
            // const token = '';
            const tokens = await getTokens();
            if (tokens?.accessToken) {
                config.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
            }
            config.headers['Content-Type'] = contentType;
            config.headers['Accept'] = 'application/json';
            return config;
        },
        err => Promise.reject(err)
    );

    axiosInstance.interceptors.response.use(
        res => res.data,
        async (error)=>{
            const originalRequest = error.config;

            if(error.res?.status===401 && !originalRequest._retry){
                originalRequest._rety = true;
                try{
                    const tokens = await getTokens();

                    const res = await axios.post(`${appInfo.BASE_URL}/users/refresh-token`,{
                        refreshToken: tokens?.refreshToken,
                    });
                    const newAccessToken = res.token;
                    await saveTokens(newAccessToken, tokens.refreshToken);

                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                }catch(refreshErr){
                    deleteTokens();
                    return Promise.reject(refreshErr);
                }
            }
            return Promise.reject(error);
        }
    );
    return axiosInstance;
};
export default AxiosInstance;