import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store/store';
import { searchFoods, updateFilters } from '../../store/slices/foodSlice';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

interface FoodListScreenProps {
  navigation: any;
}

export default function FoodListScreen({ navigation }: FoodListScreenProps) {
  const navigationHook = useNavigation();
  const dispatch = useDispatch();
  const { searchResults, isLoading, filters } = useSelector((state: RootState) => state.food);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location) {
      performSearch();
    }
  }, [location, filters]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('位置情報の許可が拒否されました');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.log('位置情報の取得に失敗しました:', error);
    }
  };

  const performSearch = async () => {
    if (!location) return;

    const searchParams: any = {
      maxDistance: filters.maxDistance,
      maxPrice: filters.maxPrice,
    };

    if (searchQuery.trim()) {
      searchParams.query = searchQuery.trim();
    }

    if (filters.category) {
      searchParams.category = filters.category;
    }

    await dispatch(searchFoods(searchParams));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await performSearch();
    setRefreshing(false);
  };

  const handleSearch = () => {
    performSearch();
  };

  const handleFilterChange = (key: string, value: any) => {
    dispatch(updateFilters({ [key]: value }));
  };

  const handleFoodPress = (foodId: string) => {
    navigation.navigate('FoodDetail', { foodId });
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

  const getExpiryColor = (expiryDate: string) => {
    const date = new Date(expiryDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#f44336';
    if (diffDays <= 1) return '#FF9800';
    if (diffDays <= 3) return '#FFC107';
    return '#4CAF50';
  };

  const renderFoodItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => handleFoodPress(item.id)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.foodImage}
                        defaultSource={{ uri: 'https://via.placeholder.com/200x150/cccccc/666666?text=Food' }}
      />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.foodDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.foodMeta}>
          <Text style={styles.foodPrice}>
            {formatPrice(item.price)}
          </Text>
          <Text style={styles.foodOriginalPrice}>
            {formatPrice(item.originalPrice)}
          </Text>
        </View>
        <View style={styles.foodDetails}>
          <View style={styles.expiryContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text
              style={[
                styles.foodExpiry,
                { color: getExpiryColor(item.expiryDate) },
              ]}
            >
              {formatExpiryDate(item.expiryDate)}
            </Text>
          </View>
          <View style={styles.storeContainer}>
            <Ionicons name="business-outline" size={16} color="#666" />
            <Text style={styles.foodStore}>{item.storeName}</Text>
          </View>
        </View>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityText}>
            残り: {item.availableQuantity}個
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() => {
          // カートに追加する処理
          console.log('カートに追加:', item.id);
        }}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>カテゴリー</Text>
        <View style={styles.categoryButtons}>
          {['', '惣菜', 'パン', 'お弁当', 'デザート', '飲料'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                filters.category === category && styles.categoryButtonActive,
              ]}
              onPress={() => handleFilterChange('category', category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  filters.category === category && styles.categoryButtonTextActive,
                ]}
              >
                {category || 'すべて'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>最大価格</Text>
        <View style={styles.priceSlider}>
          <Text style={styles.priceValue}>¥{filters.maxPrice.toLocaleString()}</Text>
          <TouchableOpacity
            style={styles.priceButton}
            onPress={() => handleFilterChange('maxPrice', Math.max(100, filters.maxPrice - 100))}
          >
            <Ionicons name="remove" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.priceButton}
            onPress={() => handleFilterChange('maxPrice', Math.min(10000, filters.maxPrice + 100))}
          >
            <Ionicons name="add" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>最大距離</Text>
        <View style={styles.distanceSlider}>
          <Text style={styles.distanceValue}>{filters.maxDistance}km</Text>
          <TouchableOpacity
            style={styles.distanceButton}
            onPress={() => handleFilterChange('maxDistance', Math.max(1, filters.maxDistance - 1))}
          >
            <Ionicons name="remove" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.distanceButton}
            onPress={() => handleFilterChange('maxDistance', Math.min(20, filters.maxDistance + 1))}
          >
            <Ionicons name="add" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>並び順</Text>
        <View style={styles.sortButtons}>
          {[
            { key: 'distance', label: '距離順' },
            { key: 'price', label: '価格順' },
            { key: 'expiry', label: '期限順' },
          ].map((sort) => (
            <TouchableOpacity
              key={sort.key}
              style={[
                styles.sortButton,
                filters.sortBy === sort.key && styles.sortButtonActive,
              ]}
              onPress={() => handleFilterChange('sortBy', sort.key)}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  filters.sortBy === sort.key && styles.sortButtonTextActive,
                ]}
              >
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>食品一覧</Text>
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={showFilters ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#4CAF50"
          />
        </TouchableOpacity>
      </View>

      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="食品名や店舗名で検索"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>検索</Text>
        </TouchableOpacity>
      </View>

      {/* フィルター */}
      {showFilters && renderFilters()}

      {/* 食品一覧 */}
      <FlatList
        data={searchResults}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.foodList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>食品が見つかりません</Text>
            <Text style={styles.emptySubtext}>
              検索条件を変更して再度お試しください
            </Text>
          </View>
        }
        ListFooterComponent={
          isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>検索中...</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterToggleButton: {
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterRow: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  priceSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    minWidth: 80,
  },
  priceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  distanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    minWidth: 60,
  },
  distanceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  foodList: {
    padding: 15,
  },
  foodItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
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
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  foodOriginalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  foodDetails: {
    marginBottom: 8,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  foodExpiry: {
    fontSize: 12,
    marginLeft: 5,
  },
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodStore: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  quantityContainer: {
    alignItems: 'flex-end',
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
  },
  addToCartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});
