import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';

interface StoreProfileScreenProps {
  navigation: any;
}

interface StoreProfile {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  imageUrl: string;
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  categories: string[];
  latitude: number;
  longitude: number;
}

export default function StoreProfileScreen({ navigation }: StoreProfileScreenProps) {
  const navigationHook = useNavigation();
  const route = useRoute();
  
  // ダミーデータ（実際のアプリではAPIから取得）
  const [storeProfile, setStoreProfile] = useState<StoreProfile>({
    id: 'store1',
    name: '〇〇スーパー',
    description: '地域密着型のスーパーマーケットです。新鮮な食材を安価で提供し、フードロス削減にも積極的に取り組んでいます。',
    address: '東京都渋谷区〇〇1-2-3',
    phone: '03-1234-5678',
    email: 'store@example.com',
    website: 'https://example.com',
    imageUrl: 'https://example.com/store.jpg',
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true },
    },
    categories: ['惣菜', 'パン', 'お弁当', 'デザート', '飲料'],
    latitude: 35.6762,
    longitude: 139.6503,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Partial<StoreProfile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEditData(storeProfile);
  }, [storeProfile]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setEditData(prev => ({ ...prev, imageUrl: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('エラー', '画像の選択に失敗しました');
    }
  };

  const handleSave = async () => {
    if (!editData.name?.trim() || !editData.description?.trim() || !editData.address?.trim()) {
      Alert.alert('エラー', '店舗名、説明、住所は必須項目です');
      return;
    }

    setIsSubmitting(true);

    try {
      // 店舗情報更新APIを呼び出す
      // const response = await storeAPI.updateStore(storeProfile.id, editData);

      setStoreProfile(prev => ({ ...prev, ...editData }));
      setShowEditModal(false);
      Alert.alert('成功', '店舗情報を更新しました');
    } catch (error) {
      Alert.alert('エラー', '店舗情報の更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayLabel = (day: string) => {
    const dayLabels: { [key: string]: string } = {
      monday: '月',
      tuesday: '火',
      wednesday: '水',
      thursday: '木',
      friday: '金',
      saturday: '土',
      sunday: '日',
    };
    return dayLabels[day] || day;
  };

  const formatTime = (time: string) => {
    return time;
  };

  const renderBusinessHours = () => (
    <View style={styles.businessHoursContainer}>
      <Text style={styles.sectionTitle}>営業時間</Text>
      {Object.entries(storeProfile.businessHours).map(([day, hours]) => (
        <View key={day} style={styles.businessDayRow}>
          <View style={styles.dayLabel}>
            <Text style={styles.dayText}>{getDayLabel(day)}</Text>
          </View>
          
          {hours.closed ? (
            <Text style={styles.closedText}>定休日</Text>
          ) : (
            <Text style={styles.hoursText}>
              {formatTime(hours.open)} - {formatTime(hours.close)}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>取り扱いカテゴリー</Text>
      <View style={styles.categoriesList}>
        {storeProfile.categories.map((category, index) => (
          <View key={index} style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{category}</Text>
          </View>
        ))}
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>店舗情報</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons name="create-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* 店舗画像 */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: storeProfile.imageUrl }}
            style={styles.storeImage}
                            defaultSource={{ uri: 'https://via.placeholder.com/200x150/cccccc/666666?text=Store' }}
          />
        </View>

        {/* 店舗基本情報 */}
        <View style={styles.infoSection}>
          <Text style={styles.storeName}>{storeProfile.name}</Text>
          <Text style={styles.storeDescription}>{storeProfile.description}</Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.contactText}>{storeProfile.address}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color="#666" />
              <Text style={styles.contactText}>{storeProfile.phone}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={20} color="#666" />
              <Text style={styles.contactText}>{storeProfile.email}</Text>
            </View>
            
            {storeProfile.website && (
              <View style={styles.contactItem}>
                <Ionicons name="globe" size={20} color="#666" />
                <Text style={styles.contactText}>{storeProfile.website}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 営業時間 */}
        {renderBusinessHours()}

        {/* 取り扱いカテゴリー */}
        {renderCategories()}

        {/* 地図 */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>店舗の位置</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: storeProfile.latitude,
              longitude: storeProfile.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: storeProfile.latitude,
                longitude: storeProfile.longitude,
              }}
              title={storeProfile.name}
            />
          </MapView>
        </View>

        {/* 統計情報 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>統計情報</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>投稿された食品</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>89</Text>
              <Text style={styles.statLabel}>購入された食品</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>¥45,230</Text>
              <Text style={styles.statLabel}>削減されたフードロス</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>評価</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 編集モーダル */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>店舗情報編集</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEditModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* 店舗画像 */}
            <View style={styles.modalImageSection}>
              <Text style={styles.modalSectionTitle}>店舗画像</Text>
              <TouchableOpacity
                style={styles.modalImagePicker}
                onPress={pickImage}
              >
                <Image
                  source={{ uri: editData.imageUrl || storeProfile.imageUrl }}
                  style={styles.modalSelectedImage}
                />
                <View style={styles.modalImageOverlay}>
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.modalImageOverlayText}>変更</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 基本情報 */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>基本情報</Text>
              
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>店舗名 *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editData.name}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, name: text }))}
                  placeholder="店舗名を入力"
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>説明 *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={editData.description}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, description: text }))}
                  placeholder="店舗の説明を入力"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>住所 *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editData.address}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, address: text }))}
                  placeholder="住所を入力"
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>電話番号</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editData.phone}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, phone: text }))}
                  placeholder="電話番号を入力"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>メールアドレス</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editData.email}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, email: text }))}
                  placeholder="メールアドレスを入力"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>ウェブサイト</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editData.website}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, website: text }))}
                  placeholder="ウェブサイトURLを入力"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <Text style={styles.modalSaveButtonText}>
                {isSubmitting ? '保存中...' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 10,
  },
  imageContainer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  storeImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  storeDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  contactInfo: {
    gap: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  businessHoursContainer: {
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
  businessDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayLabel: {
    width: 40,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  hoursText: {
    fontSize: 16,
    color: '#666',
  },
  closedText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryTag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryTagText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  mapSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 10,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalImageSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalImagePicker: {
    position: 'relative',
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalSelectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  modalImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageOverlayText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalInputContainer: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 15,
  },
  modalCancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
