import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, API_TIMEOUT } from '../config';

// Axiosインスタンスの作成
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（トークンの自動付与）
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('トークン取得エラー:', error);
    }
    return config;
  },
  (error) => {
    console.error('リクエストエラー:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API レスポンスエラー:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // トークンが無効な場合、ログアウト処理
      try {
        await SecureStore.deleteItemAsync('authToken');
        // ここでログイン画面にリダイレクトする処理を追加
      } catch (secureStoreError) {
        console.error('SecureStore削除エラー:', secureStoreError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 認証API
export const authAPI = {
  // ログイン
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    await SecureStore.setItemAsync('authToken', token);
    return { token, user };
  },

  // 登録
  register: async (email: string, password: string, name: string, role: 'user' | 'store') => {
    const response = await api.post('/auth/register', { email, password, name, role });
    const { token, user } = response.data;
    await SecureStore.setItemAsync('authToken', token);
    return { token, user };
  },

  // ログアウト
  logout: async () => {
    await SecureStore.deleteItemAsync('authToken');
    return true;
  },

  // プロフィール更新
  updateProfile: async (profileData: any) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // 現在のユーザー情報取得
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// 食品API
export const foodAPI = {
  // 近くの食品取得
  getNearbyFoods: async (latitude: number, longitude: number, radius: number) => {
    const response = await api.get('/foods/nearby', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },

  // 食品検索
  searchFoods: async (searchParams: any) => {
    const response = await api.get('/foods/search', { params: searchParams });
    return response.data;
  },

  // 食品詳細取得
  getFoodDetail: async (foodId: string) => {
    const response = await api.get(`/foods/${foodId}`);
    return response.data;
  },

  // 食品作成
  createFood: async (foodData: FormData) => {
    const response = await api.post('/foods', foodData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 食品更新
  updateFood: async (foodId: string, foodData: any) => {
    const response = await api.put(`/foods/${foodId}`, foodData);
    return response.data;
  },

  // 食品削除
  deleteFood: async (foodId: string) => {
    await api.delete(`/foods/${foodId}`);
    return true;
  },
};

// 店舗API
export const storeAPI = {
  // 店舗登録
  register: async (storeData: any) => {
    const response = await api.post('/stores', storeData);
    return response.data;
  },

  // 店舗情報取得
  getStoreInfo: async (storeId: string) => {
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  },

  // 店舗情報更新
  updateStoreInfo: async (storeId: string, storeData: any) => {
    const response = await api.put(`/stores/${storeId}`, storeData);
    return response.data;
  },

  // 店舗の食品一覧取得
  getStoreFoods: async (storeId: string) => {
    const response = await api.get(`/stores/${storeId}/foods`);
    return response.data;
  },
};

// カート・予約API
export const cartAPI = {
  // カートに追加
  addToCart: async (foodId: string, quantity: number) => {
    const response = await api.post('/cart/items', { foodId, quantity });
    return response.data;
  },

  // カートの内容取得
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // カートから削除
  removeFromCart: async (itemId: string) => {
    await api.delete(`/cart/items/${itemId}`);
    return true;
  },

  // カートの数量更新
  updateCartItem: async (itemId: string, quantity: number) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  // 予約確定
  checkout: async (checkoutData: any) => {
    const response = await api.post('/orders', checkoutData);
    return response.data;
  },

  // 予約履歴取得
  getOrderHistory: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
};

// 位置情報API
export const locationAPI = {
  // 現在地から近い店舗検索
  searchNearbyStores: async (latitude: number, longitude: number, radius: number) => {
    const response = await api.get('/stores/nearby', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  },

  // 住所から座標取得（ジオコーディング）
  geocode: async (address: string) => {
    const response = await api.get('/geocode', { params: { address } });
    return response.data;
  },
};

export default api;
