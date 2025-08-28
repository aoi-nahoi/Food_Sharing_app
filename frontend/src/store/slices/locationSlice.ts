import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationState {
  currentLocation: Location | null;
  userLocation: Location | null;
  searchLocation: Location | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
  isLocationEnabled: boolean;
}

const initialState: LocationState = {
  currentLocation: null,
  userLocation: null,
  searchLocation: null,
  loading: false,
  error: null,
  hasPermission: false,
  isLocationEnabled: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
      state.error = null;
    },
    
    setUserLocation: (state, action: PayloadAction<Location>) => {
      state.userLocation = action.payload;
      state.error = null;
    },
    
    setSearchLocation: (state, action: PayloadAction<Location>) => {
      state.searchLocation = action.payload;
      state.error = null;
    },
    
    setLocationPermission: (state, action: PayloadAction<boolean>) => {
      state.hasPermission = action.payload;
    },
    
    setLocationEnabled: (state, action: PayloadAction<boolean>) => {
      state.isLocationEnabled = action.payload;
    },
    
    setLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setLocationError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearLocationError: (state) => {
      state.error = null;
    },
    
    clearSearchLocation: (state) => {
      state.searchLocation = null;
    },
    
    resetLocation: (state) => {
      state.currentLocation = null;
      state.userLocation = null;
      state.searchLocation = null;
      state.error = null;
      state.loading = false;
    },
    
    updateLocationAccuracy: (state, action: PayloadAction<{ latitude: number; longitude: number; accuracy: number }>) => {
      const { latitude, longitude, accuracy } = action.payload;
      
      if (state.currentLocation && 
          Math.abs(state.currentLocation.latitude - latitude) < 0.001 && 
          Math.abs(state.currentLocation.longitude - longitude) < 0.001) {
        state.currentLocation.accuracy = accuracy;
      }
      
      if (state.userLocation && 
          Math.abs(state.userLocation.latitude - latitude) < 0.001 && 
          Math.abs(state.userLocation.longitude - longitude) < 0.001) {
        state.userLocation.accuracy = accuracy;
      }
    },
  },
});

export const {
  setCurrentLocation,
  setUserLocation,
  setSearchLocation,
  setLocationPermission,
  setLocationEnabled,
  setLocationLoading,
  setLocationError,
  clearLocationError,
  clearSearchLocation,
  resetLocation,
  updateLocationAccuracy,
} = locationSlice.actions;

export default locationSlice.reducer;
