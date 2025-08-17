import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { foodAPI } from '../../services/api';

export interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  quantity: number;
  availableQuantity: number;
  imageUrl: string;
  expiryDate: string;
  storeId: string;
  storeName: string;
  storeLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FoodState {
  foods: Food[];
  nearbyFoods: Food[];
  searchResults: Food[];
  selectedFood: Food | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string;
    maxPrice: number;
    maxDistance: number;
    sortBy: 'price' | 'distance' | 'expiry';
  };
}

const initialState: FoodState = {
  foods: [],
  nearbyFoods: [],
  searchResults: [],
  selectedFood: null,
  isLoading: false,
  error: null,
  filters: {
    category: '',
    maxPrice: 10000,
    maxDistance: 10,
    sortBy: 'distance',
  },
};

// 非同期アクション
export const fetchNearbyFoods = createAsyncThunk(
  'food/fetchNearbyFoods',
  async ({ latitude, longitude, radius }: { latitude: number; longitude: number; radius: number }) => {
    const response = await foodAPI.getNearbyFoods(latitude, longitude, radius);
    return response;
  }
);

export const searchFoods = createAsyncThunk(
  'food/searchFoods',
  async (searchParams: { query?: string; category?: string; maxPrice?: number; maxDistance?: number }) => {
    const response = await foodAPI.searchFoods(searchParams);
    return response;
  }
);

export const fetchFoodDetail = createAsyncThunk(
  'food/fetchFoodDetail',
  async (foodId: string) => {
    const response = await foodAPI.getFoodDetail(foodId);
    return response;
  }
);

export const createFood = createAsyncThunk(
  'food/createFood',
  async (foodData: FormData) => {
    const response = await foodAPI.createFood(foodData);
    return response;
  }
);

export const updateFood = createAsyncThunk(
  'food/updateFood',
  async ({ id, foodData }: { id: string; foodData: Partial<Food> }) => {
    const response = await foodAPI.updateFood(id, foodData);
    return response;
  }
);

export const deleteFood = createAsyncThunk(
  'food/deleteFood',
  async (foodId: string) => {
    await foodAPI.deleteFood(foodId);
    return foodId;
  }
);

const foodSlice = createSlice({
  name: 'food',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedFood: (state, action: PayloadAction<Food | null>) => {
      state.selectedFood = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<FoodState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateFoodQuantity: (state, action: PayloadAction<{ foodId: string; quantity: number }>) => {
      const food = state.foods.find(f => f.id === action.payload.foodId);
      if (food) {
        food.availableQuantity = action.payload.quantity;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 近くの食品取得
      .addCase(fetchNearbyFoods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyFoods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyFoods = action.payload;
        state.error = null;
      })
      .addCase(fetchNearbyFoods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '食品の取得に失敗しました';
      })
      // 食品検索
      .addCase(searchFoods.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchFoods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
        state.error = null;
      })
      .addCase(searchFoods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '検索に失敗しました';
      })
      // 食品詳細取得
      .addCase(fetchFoodDetail.fulfilled, (state, action) => {
        state.selectedFood = action.payload;
      })
      // 食品作成
      .addCase(createFood.fulfilled, (state, action) => {
        state.foods.unshift(action.payload);
      })
      // 食品更新
      .addCase(updateFood.fulfilled, (state, action) => {
        const index = state.foods.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.foods[index] = action.payload;
        }
      })
      // 食品削除
      .addCase(deleteFood.fulfilled, (state, action) => {
        state.foods = state.foods.filter(f => f.id !== action.payload);
        state.nearbyFoods = state.nearbyFoods.filter(f => f.id !== action.payload);
        state.searchResults = state.searchResults.filter(f => f.id !== action.payload);
      });
  },
});

export const { 
  clearError, 
  setSelectedFood, 
  updateFilters, 
  clearSearchResults, 
  updateFoodQuantity 
} = foodSlice.actions;

export default foodSlice.reducer;
