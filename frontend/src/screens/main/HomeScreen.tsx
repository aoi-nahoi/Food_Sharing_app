import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store/store';
import { fetchNearbyFoods } from '../../store/slices/foodSlice';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { nearbyFoods, isLoading } = useSelector((state: RootState) => state.food);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('位置情報の許可が拒否されました');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // 近くの食品を取得
      dispatch(fetchNearbyFoods({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        radius: 5, // 5km圏内
      }));
    } catch (error) {
      console.log('位置情報の取得に失敗しました:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await dispatch(fetchNearbyFoods({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 5,
      }));
    }
    setRefreshing(false);
  };

  const handleFoodPress = (foodId: string) => {
    navigation.navigate('FoodDetail', { foodId });
  };

  const handleSearchPress = () => {
    navigation.navigate('FoodList');
  };

  const handleMapPress = () => {
    navigation.navigate('Map');
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user?.role === 'store' ? '店舗管理者' : 'お疲れ様です'}
            </Text>
            <Text style={styles.userName}>{user?.name}さん</Text>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleCartPress}
          >
            <Ionicons name="cart" size={24} color="#fff" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>0</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* クイックアクション */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSearchPress}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="search" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>食品を探す</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMapPress}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="map" size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>地図で見る</Text>
          </TouchableOpacity>

          {user?.role === 'store' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('FoodPost')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="add-circle" size={24} color="#2196F3" />
              </View>
              <Text style={styles.actionText}>食品を投稿</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 近くの食品 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>近くの食品</Text>
            <TouchableOpacity onPress={handleSearchPress}>
              <Text style={styles.seeAllText}>すべて見る</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>読み込み中...</Text>
            </View>
          ) : nearbyFoods.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.foodList}
            >
              {nearbyFoods.slice(0, 5).map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.foodCard}
                  onPress={() => handleFoodPress(food.id)}
                >
                  <Image
                    source={{ uri: food.imageUrl }}
                    style={styles.foodImage}
                    defaultSource={require('../../../assets/placeholder-food.png')}
                  />
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName} numberOfLines={2}>
                      {food.name}
                    </Text>
                    <Text style={styles.foodPrice}>
                      {formatPrice(food.price)}
                    </Text>
                    <Text style={styles.foodExpiry}>
                      {formatExpiryDate(food.expiryDate)}
                    </Text>
                    <Text style={styles.foodStore}>{food.storeName}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>近くに食品が見つかりません</Text>
              <Text style={styles.emptySubtext}>
                位置情報を許可して、近くの食品を探してみましょう
              </Text>
            </View>
          )}
        </View>

        {/* 統計情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日の統計</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>投稿された食品</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>購入された食品</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>¥15,420</Text>
              <Text style={styles.statLabel}>節約金額</Text>
            </View>
          </View>
        </View>

        {/* お知らせ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>お知らせ</Text>
          <View style={styles.notificationCard}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>
                新機能が追加されました
              </Text>
              <Text style={styles.notificationText}>
                地図上で食品の位置を確認できるようになりました
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    position: 'relative',
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
  },
  cartBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  foodList: {
    paddingRight: 20,
  },
  foodCard: {
    width: width * 0.4,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  foodImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  foodInfo: {
    padding: 12,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  foodExpiry: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 4,
  },
  foodStore: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
  },
});
