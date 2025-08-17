import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { StatusBar } from 'expo-status-bar';

// 認証画面
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// メイン画面
import HomeScreen from './src/screens/main/HomeScreen';
import MapScreen from './src/screens/main/MapScreen';
import FoodListScreen from './src/screens/main/FoodListScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';

// 店舗画面
import StoreRegisterScreen from './src/screens/store/StoreRegisterScreen';
import FoodPostScreen from './src/screens/store/FoodPostScreen';
import StoreProfileScreen from './src/screens/store/StoreProfileScreen';

// 共通画面
import FoodDetailScreen from './src/screens/common/FoodDetailScreen';
import CartScreen from './src/screens/common/CartScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// メインタブナビゲーション
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          title: '地図',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="FoodList" 
        component={FoodListScreen}
        options={{
          title: '食品一覧',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="restaurant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'プロフィール',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// 店舗タブナビゲーション
function StoreTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="StoreHome" 
        component={HomeScreen}
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="store" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="FoodPost" 
        component={FoodPostScreen}
        options={{
          title: '食品投稿',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="add-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="StoreProfile" 
        component={StoreProfileScreen}
        options={{
          title: '店舗情報',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="business" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// タブアイコンコンポーネント
function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return (
    <Text style={{ color, fontSize: size }}>
      {name === 'home' && '🏠'}
      {name === 'map' && '🗺️'}
      {name === 'restaurant' && '🍽️'}
      {name === 'person' && '👤'}
      {name === 'store' && '🏪'}
      {name === 'add-circle' && '➕'}
      {name === 'business' && '🏢'}
    </Text>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          {/* 認証画面 */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          
          {/* メイン画面 */}
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="StoreTabs" component={StoreTabNavigator} />
          
          {/* 共通画面 */}
          <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="StoreRegister" component={StoreRegisterScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

// 一時的なTextコンポーネント（後でreact-native-elementsに置き換え）
const Text = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <span style={style}>{children}</span>
);
