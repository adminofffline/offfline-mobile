import { Platform } from 'react-native';

const PRODUCTION_API_URL = 'https://api.offfline.in/api';
const PRODUCTION_BACKEND_ORIGIN = 'https://api.offfline.in';

export const CONFIG = {
  API_BASE_URL: PRODUCTION_API_URL,
  BACKEND_ORIGIN: PRODUCTION_BACKEND_ORIGIN,
  APP_NAME: 'Offfline',
  APP_VERSION: '1.0.0',
  PLATFORM: Platform.OS,
  DEFAULT_LOCATION: {
    name: 'Chennai GPO (600001)',
    pincode: '600001',
    latitude: 13.0827,
    longitude: 80.2707,
    accuracy: 5,
  },
  SCAN_DEBOUNCE_MS: 1200,
  REQUEST_TIMEOUT_MS: 15000,
};

export default CONFIG;
