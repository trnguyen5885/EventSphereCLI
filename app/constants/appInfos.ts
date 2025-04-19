import { Dimensions } from 'react-native';

export const appInfo = {
    sizes:{
        WIDTH: Dimensions.get('window').width,
        HEIGTH: Dimensions.get('window').height,
    },
    BASE_URL: 'https://eventssphereapi.onrender.com/api',
    BASE_URL_NOAPI: 'https://eventssphereapi.onrender.com',
};
