// API設定
export const API_CONFIG = {
  // 開発環境
  development: {
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
  },
  // 本番環境
  production: {
    baseURL: 'http://172.21.151.229:8080/api',
    timeout: 15000,
  }
};

// 現在の環境に応じた設定を取得
const isDevelopment = __DEV__;
export const API_BASE_URL = isDevelopment 
  ? API_CONFIG.development.baseURL 
  : API_CONFIG.production.baseURL;

export const API_TIMEOUT = isDevelopment 
  ? API_CONFIG.development.timeout 
  : API_CONFIG.production.timeout;