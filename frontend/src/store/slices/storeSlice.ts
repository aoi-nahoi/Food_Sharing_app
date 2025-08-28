import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  imageUrl?: string;
  category: string;
  rating: number;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreState {
  stores: Store[];
  currentStore: Store | null;
  loading: boolean;
  error: string | null;
  selectedStore: Store | null;
}

const initialState: StoreState = {
  stores: [],
  currentStore: null,
  loading: false,
  error: null,
  selectedStore: null,
};

// 店舗一覧を取得
export const fetchStores = createAsyncThunk(
  'store/fetchStores',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/stores');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '店舗情報の取得に失敗しました');
    }
  }
);

// 店舗詳細を取得
export const fetchStoreById = createAsyncThunk(
  'store/fetchStoreById',
  async (storeId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/stores/${storeId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '店舗情報の取得に失敗しました');
    }
  }
);

// 店舗を登録
export const createStore = createAsyncThunk(
  'store/createStore',
  async (storeData: Partial<Store>, { rejectWithValue }) => {
    try {
      const response = await api.post('/stores', storeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '店舗の登録に失敗しました');
    }
  }
);

// 店舗情報を更新
export const updateStore = createAsyncThunk(
  'store/updateStore',
  async ({ storeId, storeData }: { storeId: string; storeData: Partial<Store> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/stores/${storeId}`, storeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '店舗情報の更新に失敗しました');
    }
  }
);

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setCurrentStore: (state, action: PayloadAction<Store>) => {
      state.currentStore = action.payload;
    },
    setSelectedStore: (state, action: PayloadAction<Store>) => {
      state.selectedStore = action.payload;
    },
    clearCurrentStore: (state) => {
      state.currentStore = null;
    },
    clearSelectedStore: (state) => {
      state.selectedStore = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchStores
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchStoreById
      .addCase(fetchStoreById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStore = action.payload;
      })
      .addCase(fetchStoreById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createStore
      .addCase(createStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.loading = false;
        state.stores.push(action.payload);
        state.currentStore = action.payload;
      })
      .addCase(createStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateStore
      .addCase(updateStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stores.findIndex(store => store.id === action.payload.id);
        if (index !== -1) {
          state.stores[index] = action.payload;
        }
        if (state.currentStore?.id === action.payload.id) {
          state.currentStore = action.payload;
        }
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentStore,
  setSelectedStore,
  clearCurrentStore,
  clearSelectedStore,
  clearError,
} = storeSlice.actions;

export default storeSlice.reducer;
