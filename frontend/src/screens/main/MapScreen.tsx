import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { RootState } from '../../store/store';
import { fetchNearbyFoods } from '../../store/slices/foodSlice';

const { width, height } = Dimensions.get('window');

interface MapScreenProps {
  navigation: any;
}

export default function MapScreen({ navigation }: MapScreenProps) {
  const navigationHook = useNavigation();
  const dispatch = useDispatch();
  const { nearbyFoods, isLoading } = useSelector((state: RootState) => state.food);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 35.6762,
    longitude: 139.6503,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '位置情報の許可が必要です',
          '地図上で近くの食品を表示するために位置情報の許可が必要です。'
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation(currentLocation);
      
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(newRegion);
      
      // 近くの食品を取得
      dispatch(fetchNearbyFoods({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        radius: 5, // 5km圏内
      }));

      // 地図を現在位置に移動
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.log('位置情報の取得に失敗しました:', error);
      Alert.alert('エラー', '位置情報の取得に失敗しました');
    }
  };

  const handleMarkerPress = (food: any) => {
    setSelectedFood(food);
  };

  const handleFoodPress = (foodId: string) => {
    navigation.navigate('FoodDetail', { foodId });
  };

  const handleRefresh = () => {
    if (location) {
      dispatch(fetchNearbyFoods({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 5,
      }));
    }
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '期限切れ';
    if (diffDays === 0) return '今日まで';
    if (diffDays === 1) return '明日まで';
    return `${diffDays}日後まで`;
  };

  const getMarkerColor = (expiryDate: string) => {
    const date = new Date(expiryDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#f44336'; // 期限切れ
    if (diffDays <= 1) return '#FF9800'; // 今日・明日
    if (diffDays <= 3) return '#FFC107'; // 3日以内
    return '#4CAF50'; // それ以外
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {nearbyFoods.map((food) => (
          <Marker
            key={food.id}
            coordinate={{
              latitude: food.storeLocation.latitude,
              longitude: food.storeLocation.longitude,
            }}
            pinColor={getMarkerColor(food.expiryDate)}
            onPress={() => handleMarkerPress(food)}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{food.name}</Text>
                <Text style={styles.calloutPrice}>{formatPrice(food.price)}</Text>
                <Text style={styles.calloutExpiry}>
                  {formatExpiryDate(food.expiryDate)}
                </Text>
                <Text style={styles.calloutStore}>{food.storeName}</Text>
                <TouchableOpacity
                  style={styles.calloutButton}
                  onPress={() => handleFoodPress(food.id)}
                >
                  <Text style={styles.calloutButtonText}>詳細を見る</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>地図</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Ionicons
            name="refresh"
            size={24}
            color="#fff"
            style={isLoading ? styles.rotating : {}}
          />
        </TouchableOpacity>
      </View>

      {/* 現在位置ボタン */}
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={getCurrentLocation}
      >
        <Ionicons name="locate" size={24} color="#4CAF50" />
      </TouchableOpacity>

      {/* 選択された食品の詳細 */}
      {selectedFood && (
        <View style={styles.foodDetailCard}>
          <View style={styles.foodDetailHeader}>
            <Text style={styles.foodDetailTitle}>{selectedFood.name}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedFood(null)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.foodDetailInfo}>
            <View style={styles.foodDetailRow}>
              <Text style={styles.foodDetailLabel}>価格:</Text>
              <Text style={styles.foodDetailValue}>
                {formatPrice(selectedFood.price)}
              </Text>
            </View>
            
            <View style={styles.foodDetailRow}>
              <Text style={styles.foodDetailLabel}>期限:</Text>
              <Text style={styles.foodDetailValue}>
                {formatExpiryDate(selectedFood.expiryDate)}
              </Text>
            </View>
            
            <View style={styles.foodDetailRow}>
              <Text style={styles.foodDetailLabel}>店舗:</Text>
              <Text style={styles.foodDetailValue}>
                {selectedFood.storeName}
              </Text>
            </View>
            
            <View style={styles.foodDetailRow}>
              <Text style={styles.foodDetailLabel}>住所:</Text>
              <Text style={styles.foodDetailValue}>
                {selectedFood.storeLocation.address}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => handleFoodPress(selectedFood.id)}
          >
            <Text style={styles.detailButtonText}>詳細を見る</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 食品一覧ボタン */}
      <TouchableOpacity
        style={styles.listButton}
        onPress={() => navigation.navigate('FoodList')}
      >
        <Ionicons name="list" size={24} color="#fff" />
        <Text style={styles.listButtonText}>一覧表示</Text>
      </TouchableOpacity>

      {/* ローディングオーバーレイ */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>食品を検索中...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 200,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listButton: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  foodDetailCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  foodDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  foodDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  foodDetailInfo: {
    marginBottom: 15,
  },
  foodDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  foodDetailLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  foodDetailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  detailButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  callout: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  calloutPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 3,
  },
  calloutExpiry: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 3,
  },
  calloutStore: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  calloutButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});
