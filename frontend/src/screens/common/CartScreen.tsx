import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface CartScreenProps {
  navigation: any;
}

interface CartItem {
  id: string;
  foodId: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  quantity: number;
  imageUrl: string;
  storeName: string;
  expiryDate: string;
}

export default function CartScreen({ navigation }: CartScreenProps) {
  const navigationHook = useNavigation();
  
  // ダミーデータ（実際のアプリではReduxから取得）
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      foodId: 'food1',
      name: 'お弁当セット',
      description: '新鮮な野菜とお肉を使ったお弁当',
      price: 300,
      originalPrice: 500,
      quantity: 2,
      imageUrl: 'https://example.com/bento.jpg',
      storeName: '〇〇スーパー',
      expiryDate: '2024-01-15T18:00:00Z',
    },
    {
      id: '2',
      foodId: 'food2',
      name: 'パンセット',
      description: '朝食にぴったりのパンセット',
      price: 200,
      originalPrice: 300,
      quantity: 1,
      imageUrl: 'https://example.com/bread.jpg',
      storeName: '△△ベーカリー',
      expiryDate: '2024-01-16T12:00:00Z',
    },
  ]);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    Alert.alert(
      '商品を削除',
      'この商品をカートから削除しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            setCartItems(prev => prev.filter(item => item.id !== itemId));
          },
        },
      ]
    );
  };

  const clearCart = () => {
    if (cartItems.length === 0) return;

    Alert.alert(
      'カートを空にする',
      'カート内のすべての商品を削除しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            setCartItems([]);
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('エラー', 'カートに商品がありません');
      return;
    }

    // チェックアウト処理
    Alert.alert(
      '購入確認',
      `合計${formatPrice(getTotalPrice())}の商品を購入しますか？`,
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
            setCartItems([]);
          },
        },
      ]
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalOriginalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.originalPrice * item.quantity), 0);
  };

  const getTotalSavings = () => {
    return getTotalOriginalPrice() - getTotalPrice();
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

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.itemImage}
        defaultSource={require('../../../assets/placeholder-food.png')}
      />
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.itemMeta}>
          <View style={styles.expiryContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text
              style={[
                styles.expiryText,
                { color: getExpiryColor(item.expiryDate) },
              ]}
            >
              {formatExpiryDate(item.expiryDate)}
            </Text>
          </View>
          
          <View style={styles.storeContainer}>
            <Ionicons name="business-outline" size={16} color="#666" />
            <Text style={styles.storeName}>{item.storeName}</Text>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            {formatPrice(item.price)}
          </Text>
          <Text style={styles.originalPrice}>
            {formatPrice(item.originalPrice)}
          </Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%OFF
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={20} color="#666" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.itemTotal}>
          <Text style={styles.itemTotalPrice}>
            {formatPrice(item.price * item.quantity)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>カート</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.emptyContent}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>カートが空です</Text>
          <Text style={styles.emptySubtitle}>
            商品を追加してフードロス削減に参加しましょう
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('FoodList')}
          >
            <Text style={styles.shopButtonText}>商品を探す</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>カート</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearCart}
        >
          <Text style={styles.clearButtonText}>空にする</Text>
        </TouchableOpacity>
      </View>

      {/* カート商品一覧 */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      {/* 合計・チェックアウト */}
      <View style={styles.checkoutSection}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>商品数</Text>
            <Text style={styles.summaryValue}>
              {cartItems.reduce((total, item) => total + item.quantity, 0)}個
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>定価合計</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(getTotalOriginalPrice())}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>割引</Text>
            <Text style={styles.summaryValue}>
              -{formatPrice(getTotalSavings())}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>お支払い金額</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(getTotalPrice())}
            </Text>
          </View>
          
          <View style={styles.savingsInfo}>
            <Ionicons name="leaf-outline" size={16} color="#4CAF50" />
            <Text style={styles.savingsText}>
              フードロス削減に貢献！{formatPrice(getTotalSavings())}お得
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>
            {formatPrice(getTotalPrice())}で購入する
          </Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: 10,
  },
  clearButtonText: {
    color: '#f44336',
    fontSize: 16,
  },
  placeholder: {
    width: 44,
  },
  cartList: {
    padding: 20,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  itemMeta: {
    marginBottom: 8,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  expiryText: {
    fontSize: 12,
    marginLeft: 5,
  },
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 80,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    marginBottom: 10,
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  removeButton: {
    padding: 8,
  },
  checkoutSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  savingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  savingsText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  shopButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
