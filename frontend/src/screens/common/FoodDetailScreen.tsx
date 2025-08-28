import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store/store';
import { fetchFoodDetail } from '../../store/slices/foodSlice';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

interface FoodDetailScreenProps {
  navigation: any;
}

export default function FoodDetailScreen({ navigation }: FoodDetailScreenProps) {
  const navigationHook = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { selectedFood, isLoading } = useSelector((state: RootState) => state.food);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const foodId = route.params?.foodId;

  useEffect(() => {
    if (foodId) {
      dispatch(fetchFoodDetail(foodId));
    }
  }, [foodId, dispatch]);

  const handleAddToCart = async () => {
    if (!selectedFood) return;

    if (quantity > selectedFood.availableQuantity) {
      Alert.alert('エラー', '在庫数を超えています');
      return;
    }

    setIsAddingToCart(true);

    try {
      // カートに追加する処理
      // await dispatch(addToCart({
      //   foodId: selectedFood.id,
      //   quantity,
      //   price: selectedFood.price,
      // })).unwrap();

      Alert.alert(
        'カートに追加',
        'カートに追加しました',
        [
          {
            text: 'カートを見る',
            onPress: () => navigation.navigate('Cart'),
          },
          {
            text: '買い物を続ける',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('エラー', 'カートへの追加に失敗しました');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!selectedFood) return;

    if (quantity > selectedFood.availableQuantity) {
      Alert.alert('エラー', '在庫数を超えています');
      return;
    }

    // 即座に購入する処理
    Alert.alert(
      '購入確認',
      `「${selectedFood.name}」を${quantity}個購入しますか？`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '購入する',
          onPress: () => {
            // 購入処理
            Alert.alert('購入完了', '購入が完了しました');
          },
        },
      ]
    );
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

  if (isLoading || !selectedFood) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="heart-outline" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 食品画像 */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedFood.imageUrl }}
            style={styles.foodImage}
                            defaultSource={{ uri: 'https://via.placeholder.com/300x200/cccccc/666666?text=Food' }}
          />
          <View style={styles.imageOverlay}>
            <View style={styles.expiryBadge}>
              <Text style={styles.expiryBadgeText}>
                {formatExpiryDate(selectedFood.expiryDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* 食品情報 */}
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{selectedFood.name}</Text>
          <Text style={styles.foodDescription}>{selectedFood.description}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              {formatPrice(selectedFood.price)}
            </Text>
            <Text style={styles.originalPrice}>
              {formatPrice(selectedFood.originalPrice)}
            </Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round(((selectedFood.originalPrice - selectedFood.price) / selectedFood.originalPrice) * 100)}%OFF
              </Text>
            </View>
          </View>

          <View style={styles.storeInfo}>
            <Ionicons name="business" size={20} color="#666" />
            <Text style={styles.storeName}>{selectedFood.storeName}</Text>
          </View>

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>数量</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={20} color={quantity <= 1 ? "#ccc" : "#666"} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.min(selectedFood.availableQuantity, quantity + 1))}
                disabled={quantity >= selectedFood.availableQuantity}
              >
                <Ionicons name="add" size={20} color={quantity >= selectedFood.availableQuantity ? "#ccc" : "#666"} />
              </TouchableOpacity>
            </View>
            <Text style={styles.availableQuantity}>
              在庫: {selectedFood.availableQuantity}個
            </Text>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>合計</Text>
            <Text style={styles.totalPrice}>
              {formatPrice(selectedFood.price * quantity)}
            </Text>
          </View>
        </View>

        {/* 詳細情報 */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>詳細情報</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>カテゴリー</Text>
            <Text style={styles.detailValue}>{selectedFood.category}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>タグ</Text>
            <View style={styles.tagsContainer}>
              {selectedFood.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>投稿日</Text>
            <Text style={styles.detailValue}>
              {new Date(selectedFood.createdAt).toLocaleDateString('ja-JP')}
            </Text>
          </View>
        </View>

        {/* 店舗情報 */}
        <View style={styles.storeSection}>
          <Text style={styles.sectionTitle}>店舗情報</Text>
          
          <View style={styles.storeCard}>
            <View style={styles.storeHeader}>
              <Text style={styles.storeTitle}>{selectedFood.storeName}</Text>
              <TouchableOpacity
                style={styles.storeDetailButton}
                onPress={() => navigation.navigate('StoreProfile', { storeId: selectedFood.storeId })}
              >
                <Text style={styles.storeDetailButtonText}>詳細</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.storeAddress}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.storeAddressText}>
                {selectedFood.storeLocation.address}
              </Text>
            </View>
          </View>
        </View>

        {/* 地図 */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>店舗の位置</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: selectedFood.storeLocation.latitude,
              longitude: selectedFood.storeLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: selectedFood.storeLocation.latitude,
                longitude: selectedFood.storeLocation.longitude,
              }}
              title={selectedFood.storeName}
            />
          </MapView>
        </View>
      </ScrollView>

      {/* アクションボタン */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          <Ionicons name="cart-outline" size={24} color="#fff" />
          <Text style={styles.cartButtonText}>
            {isAddingToCart ? '追加中...' : 'カートに追加'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.buyButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyButtonText}>今すぐ購入</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    padding: 10,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#fff',
  },
  foodImage: {
    width: '100%',
    height: 300,
  },
  imageOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  expiryBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  expiryBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  foodInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  foodDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 15,
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 15,
  },
  discountBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  storeName: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  availableQuantity: {
    fontSize: 14,
    color: '#666',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  detailsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  storeSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  storeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  storeDetailButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  storeDetailButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  storeAddress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeAddressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  mapSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 100, // アクションバーの高さ分
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 15,
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});
