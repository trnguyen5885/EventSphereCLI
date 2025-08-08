import { Dimensions } from 'react-native';

export const appInfo = {
    sizes:{
        WIDTH: Dimensions.get('window').width,
        HEIGTH: Dimensions.get('window').height,
    },
    BASE_URL: 'https://api.eventsphere.io.vn/api',
    BASE_URL_NOAPI: 'https://api.eventsphere.io.vn',
};
