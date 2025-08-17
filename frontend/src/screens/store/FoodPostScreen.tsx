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
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FoodPostScreenProps {
  navigation: any;
}

export default function FoodPostScreen({ navigation }: FoodPostScreenProps) {
  const navigationHook = useNavigation();
  
  const [foodName, setFoodName] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [foodImage, setFoodImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoExpiry, setAutoExpiry] = useState(true);

  const availableCategories = [
    '惣菜', 'パン', 'お弁当', 'デザート', '飲料', '野菜', '果物', '肉', '魚', '乳製品'
  ];

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFoodImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('エラー', '画像の選択に失敗しました');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFoodImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('エラー', 'カメラの起動に失敗しました');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      '画像を選択',
      '画像の選択方法を選んでください',
      [
        {
          text: 'カメラで撮影',
          onPress: takePhoto,
        },
        {
          text: 'ライブラリから選択',
          onPress: pickImage,
        },
        {
          text: 'キャンセル',
          style: 'cancel',
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP');
  };

  const calculateDiscountPrice = () => {
    const original = parseInt(originalPrice) || 0;
    const discount = parseInt(discountPrice) || 0;
    
    if (original > 0 && discount > 0) {
      return Math.max(0, original - discount);
    }
    return 0;
  };

  const getDiscountPercentage = () => {
    const original = parseInt(originalPrice) || 0;
    const discount = parseInt(discountPrice) || 0;
    
    if (original > 0 && discount > 0) {
      return Math.round((discount / original) * 100);
    }
    return 0;
  };

  const handleSubmit = async () => {
    if (!foodName.trim() || !foodDescription.trim() || !originalPrice.trim()) {
      Alert.alert('エラー', '食品名、説明、定価は必須項目です');
      return;
    }

    if (!foodImage) {
      Alert.alert('エラー', '食品の画像を選択してください');
      return;
    }

    if (parseInt(quantity) <= 0) {
      Alert.alert('エラー', '数量は1以上で入力してください');
      return;
    }

    if (new Date() >= expiryDate) {
      Alert.alert('エラー', '期限は現在時刻より後の日時を設定してください');
      return;
    }

    setIsSubmitting(true);

    try {
      // 食品投稿APIを呼び出す
      // const response = await foodAPI.createFood({
      //   name: foodName.trim(),
      //   description: foodDescription.trim(),
      //   originalPrice: parseInt(originalPrice),
      //   discountPrice: parseInt(discountPrice) || 0,
      //   quantity: parseInt(quantity),
      //   category,
      //   tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      //   expiryDate: expiryDate.toISOString(),
      //   image: foodImage,
      // });

      Alert.alert(
        '投稿完了',
        '食品の投稿が完了しました',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('エラー', '食品の投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    Alert.alert(
      'フォームをリセット',
      '入力内容をすべてクリアしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            setFoodName('');
            setFoodDescription('');
            setOriginalPrice('');
            setDiscountPrice('');
            setQuantity('');
            setCategory('');
            setTags('');
            setExpiryDate(new Date());
            setFoodImage(null);
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>食品を投稿</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetForm}
          >
            <Text style={styles.resetButtonText}>リセット</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* 食品画像 */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>食品画像 *</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={showImagePickerOptions}
            >
              {foodImage ? (
                <Image source={{ uri: foodImage }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={48} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>画像を選択</Text>
                  <Text style={styles.imagePlaceholderSubtext}>
                    タップして画像を選択または撮影
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 基本情報 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>基本情報</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>食品名 *</Text>
              <TextInput
                style={styles.input}
                value={foodName}
                onChangeText={setFoodName}
                placeholder="お弁当セット"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>説明 *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={foodDescription}
                onChangeText={setFoodDescription}
                placeholder="食品の特徴やアピールポイントを入力してください"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>カテゴリー</Text>
              <View style={styles.categoryContainer}>
                {availableCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>タグ</Text>
              <TextInput
                style={styles.input}
                value={tags}
                onChangeText={setTags}
                placeholder="新鮮, お得, 朝食（カンマ区切りで入力）"
              />
            </View>
          </View>

          {/* 価格・数量 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>価格・数量</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>定価 *</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceSymbol}>¥</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={originalPrice}
                  onChangeText={setOriginalPrice}
                  placeholder="500"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>割引額</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceSymbol}>¥</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={discountPrice}
                  onChangeText={setDiscountPrice}
                  placeholder="100"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {parseInt(originalPrice) > 0 && parseInt(discountPrice) > 0 && (
              <View style={styles.pricePreview}>
                <Text style={styles.pricePreviewLabel}>販売価格</Text>
                <Text style={styles.pricePreviewValue}>
                  ¥{calculateDiscountPrice().toLocaleString()}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>
                    {getDiscountPercentage()}%OFF
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>数量 *</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="10"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* 期限設定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>期限設定</Text>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>自動期限設定</Text>
              <Switch
                value={autoExpiry}
                onValueChange={setAutoExpiry}
                trackColor={{ false: '#ddd', true: '#4CAF50' }}
                thumbColor="#fff"
              />
            </View>

            {!autoExpiry && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>期限日時</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#666" />
                  <Text style={styles.datePickerText}>
                    {formatDate(expiryDate)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="datetime"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* 投稿ボタン */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? '投稿中...' : '食品を投稿する'}
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
  resetButton: {
    padding: 10,
  },
  resetButtonText: {
    color: '#f44336',
    fontSize: 16,
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
  imagePlaceholderSubtext: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
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
  categoryContainer: {
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
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceSymbol: {
    fontSize: 18,
    color: '#666',
    marginRight: 10,
  },
  priceInput: {
    flex: 1,
  },
  pricePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  pricePreviewLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  pricePreviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 10,
    flex: 1,
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
