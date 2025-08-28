import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  foodId: string;
  foodName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  storeId: string;
  storeName: string;
  description?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        item => item.foodId === action.payload.foodId && item.storeId === action.payload.storeId
      );
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      const itemIndex = state.items.findIndex(item => item.id === action.payload);
      if (itemIndex !== -1) {
        const removedItem = state.items[itemIndex];
        state.total -= removedItem.price * removedItem.quantity;
        state.itemCount -= removedItem.quantity;
        state.items.splice(itemIndex, 1);
      }
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        const oldTotal = item.price * item.quantity;
        item.quantity = action.payload.quantity;
        const newTotal = item.price * item.quantity;
        
        state.total = state.total - oldTotal + newTotal;
        state.itemCount = state.itemCount - (oldTotal / item.price) + action.payload.quantity;
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
    },
    
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const itemIndex = state.items.findIndex(item => item.id === action.payload);
      if (itemIndex !== -1) {
        const removedItem = state.items[itemIndex];
        state.total -= removedItem.price * removedItem.quantity;
        state.itemCount -= removedItem.quantity;
        state.items.splice(itemIndex, 1);
      }
    },
    
    updateCartItem: (state, action: PayloadAction<CartItem>) => {
      const itemIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (itemIndex !== -1) {
        const oldItem = state.items[itemIndex];
        state.total -= oldItem.price * oldItem.quantity;
        state.itemCount -= oldItem.quantity;
        
        state.items[itemIndex] = action.payload;
        
        state.total += action.payload.price * action.payload.quantity;
        state.itemCount += action.payload.quantity;
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  removeItemFromCart,
  updateCartItem,
} = cartSlice.actions;

export default cartSlice.reducer;
