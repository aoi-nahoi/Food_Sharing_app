import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

interface StoreRegisterScreenProps {
  navigation: any;
}

export default function StoreRegisterScreen({ navigation }: StoreRegisterScreenProps) {
  const navigationHook = useNavigation();
  const dispatch = useDispatch();
  
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeWebsite, setStoreWebsite] = useState('');
  const [storeImage, setStoreImage] = useState<string | null>(null);
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true },
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCategories = [
    '惣菜', 'パン', 'お弁当', 'デザート', '飲料', '野菜', '果物', '肉', '魚', '乳製品'
  ];

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setStoreImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('エラー', '画像の選択に失敗しました');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('位置情報の許可が必要です', '店舗の位置を自動取得するために位置情報の許可が必要です。');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      // 逆ジオコーディングで住所を取得
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        const fullAddress = [
          address.postalCode,
          address.region,
          address.city,
          address.street,
        ].filter(Boolean).join(' ');
        
        setStoreAddress(fullAddress);
      }
    } catch (error) {
      Alert.alert('エラー', '位置情報の取得に失敗しました');
    }
  };

  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const toggleBusinessDay = (day: string) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], closed: !prev[day as keyof typeof prev].closed }
    }));
  };

  const handleSubmit = async () => {
    if (!storeName.trim() || !storeDescription.trim() || !storeAddress.trim()) {
      Alert.alert('エラー', '店舗名、説明、住所は必須項目です');
      return;
    }

    if (categories.length === 0) {
      Alert.alert('エラー', '取り扱いカテゴリーを選択してください');
      return;
    }

    setIsSubmitting(true);

    try {
      // 店舗登録APIを呼び出す
      // const response = await storeAPI.registerStore({
      //   name: storeName.trim(),
      //   description: storeDescription.trim(),
      //   address: storeAddress.trim(),
      //   phone: storePhone.trim(),
      //   email: storeEmail.trim(),
      //   website: storeWebsite.trim(),
      //   image: storeImage,
      //   businessHours,
      //   categories,
      // });

      Alert.alert(
        '登録完了',
        '店舗の登録が完了しました。審査後に公開されます。',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('StoreTabs'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('エラー', '店舗の登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBusinessHours = () => (
    <View style={styles.businessHoursContainer}>
      <Text style={styles.sectionTitle}>営業時間</Text>
      {Object.entries(businessHours).map(([day, hours]) => (
        <View key={day} style={styles.businessDayRow}>
          <View style={styles.dayToggle}>
            <TouchableOpacity
              style={[
                styles.dayToggleButton,
                hours.closed && styles.dayToggleButtonClosed,
              ]}
              onPress={() => toggleBusinessDay(day)}
            >
              <Text
                style={[
                  styles.dayToggleText,
                  hours.closed && styles.dayToggleTextClosed,
                ]}
              >
                {getDayLabel(day)}
              </Text>
            </TouchableOpacity>
          </View>
          
          {!hours.closed && (
            <View style={styles.timeInputs}>
              <TextInput
                style={styles.timeInput}
                value={hours.open}
                onChangeText={(text) => {
                  setBusinessHours(prev => ({
                    ...prev,
                    [day]: { ...prev[day as keyof typeof prev], open: text }
                  }));
                }}
                placeholder="09:00"
              />
              <Text style={styles.timeSeparator}>〜</Text>
              <TextInput
                style={styles.timeInput}
                value={hours.close}
                onChangeText={(text) => {
                  setBusinessHours(prev => ({
                    ...prev,
                    [day]: { ...prev[day as keyof typeof prev], close: text }
                  }));
                }}
                placeholder="18:00"
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>店舗登録</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.form}>
          {/* 店舗画像 */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>店舗画像</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickImage}
            >
              {storeImage ? (
                <Image source={{ uri: storeImage }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={48} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>画像を選択</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 基本情報 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>基本情報</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>店舗名 *</Text>
              <TextInput
                style={styles.input}
                value={storeName}
                onChangeText={setStoreName}
                placeholder="〇〇スーパー"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>店舗説明 *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={storeDescription}
                onChangeText={setStoreDescription}
                placeholder="店舗の特徴やアピールポイントを入力してください"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>住所 *</Text>
              <View style={styles.addressContainer}>
                <TextInput
                  style={[styles.input, styles.addressInput]}
                  value={storeAddress}
                  onChangeText={setStoreAddress}
                  placeholder="東京都渋谷区..."
                />
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={getCurrentLocation}
                >
                  <Ionicons name="location" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>電話番号</Text>
              <TextInput
                style={styles.input}
                value={storePhone}
                onChangeText={setStorePhone}
                placeholder="03-1234-5678"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>メールアドレス</Text>
              <TextInput
                style={styles.input}
                value={storeEmail}
                onChangeText={setStoreEmail}
                placeholder="store@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>ウェブサイト</Text>
              <TextInput
                style={styles.input}
                value={storeWebsite}
                onChangeText={setStoreWebsite}
                placeholder="https://example.com"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* 取り扱いカテゴリー */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>取り扱いカテゴリー *</Text>
            <View style={styles.categoriesContainer}>
              {availableCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    categories.includes(category) && styles.categoryButtonActive,
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      categories.includes(category) && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 営業時間 */}
          {renderBusinessHours()}

          {/* 登録ボタン */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? '登録中...' : '店舗を登録する'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
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
  placeholder: {
    width: 44,
  },
  form: {
    padding: 20,
  },
  imageSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInput: {
    flex: 1,
    marginRight: 10,
  },
  locationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
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
  businessHoursContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  businessDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dayToggle: {
    width: 60,
  },
  dayToggleButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  dayToggleButtonClosed: {
    backgroundColor: '#ccc',
  },
  dayToggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dayToggleTextClosed: {
    color: '#666',
  },
  timeInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    width: 80,
    textAlign: 'center',
  },
  timeSeparator: {
    marginHorizontal: 10,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
