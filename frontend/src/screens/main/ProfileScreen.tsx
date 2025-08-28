import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store/store';
import { logout, updateProfile } from '../../store/slices/authSlice';
import * as ImagePicker from 'expo-image-picker';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const navigationHook = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [pushNotifications, setPushNotifications] = useState(
    user?.notificationSettings?.push || false
  );
  const [emailNotifications, setEmailNotifications] = useState(
    user?.notificationSettings?.email || false
  );

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      setShowLogoutModal(false);
    } catch (error) {
      Alert.alert('エラー', 'ログアウトに失敗しました');
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('エラー', '名前とメールアドレスを入力してください');
      return;
    }

    try {
      await dispatch(updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        notificationSettings: {
          push: pushNotifications,
          email: emailNotifications,
        },
      })).unwrap();
      
      setShowEditModal(false);
      Alert.alert('成功', 'プロフィールを更新しました');
    } catch (error) {
      Alert.alert('エラー', 'プロフィールの更新に失敗しました');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // 画像アップロード処理
        console.log('画像が選択されました:', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('エラー', '画像の選択に失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  const renderMenuItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    showArrow: boolean = true
  ) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon as any} size={24} color="#4CAF50" />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>プロフィール</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons name="create-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* プロフィール情報 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                user?.avatar
                  ? { uri: user.avatar }
                  : { uri: 'https://via.placeholder.com/100x100/cccccc/666666?text=AV' }
              }
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={pickImage}
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'store' ? '店舗管理者' : '一般ユーザー'}
          </Text>
        </View>

        {/* 統計情報 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>統計</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>購入した食品</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>¥8,420</Text>
              <Text style={styles.statLabel}>節約金額</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>お気に入り店舗</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>CO2削減(g)</Text>
            </View>
          </View>
        </View>

        {/* メニュー */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>設定</Text>
          
          {renderMenuItem(
            'notifications-outline',
            '通知設定',
            'プッシュ通知とメール通知の設定',
            () => setShowEditModal(true)
          )}
          
          {renderMenuItem(
            'location-outline',
            '位置情報',
            '位置情報の許可設定',
            () => Alert.alert('位置情報', '設定アプリで位置情報の許可を管理してください')
          )}
          
          {renderMenuItem(
            'shield-checkmark-outline',
            'プライバシー',
            'プライバシー設定とデータ管理',
            () => Alert.alert('プライバシー', 'プライバシー設定画面を開きます')
          )}
          
          {renderMenuItem(
            'help-circle-outline',
            'ヘルプ',
            'よくある質問とサポート',
            () => Alert.alert('ヘルプ', 'ヘルプ画面を開きます')
          )}
          
          {renderMenuItem(
            'information-circle-outline',
            'アプリについて',
            'バージョン情報とライセンス',
            () => Alert.alert('アプリについて', 'アプリ情報画面を開きます')
          )}
        </View>

        {/* 店舗関連メニュー（店舗ユーザーの場合） */}
        {user?.role === 'store' && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>店舗管理</Text>
            
            {renderMenuItem(
              'business-outline',
              '店舗情報',
              '店舗の基本情報を編集',
              () => navigation.navigate('StoreProfile')
            )}
            
            {renderMenuItem(
              'add-circle-outline',
              '食品投稿',
              '新しい食品を投稿',
              () => navigation.navigate('FoodPost')
            )}
            
            {renderMenuItem(
              'analytics-outline',
              '売上レポート',
              '売上と統計情報',
              () => Alert.alert('売上レポート', '売上レポート画面を開きます')
            )}
          </View>
        )}

        {/* ログアウトボタン */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
          <Text style={styles.logoutButtonText}>ログアウト</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* プロフィール編集モーダル */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>プロフィール編集</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEditModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>お名前</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="お名前を入力"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>メールアドレス</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="メールアドレスを入力"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>通知設定</Text>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>プッシュ通知</Text>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#ddd', true: '#4CAF50' }}
                  thumbColor="#fff"
                />
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>メール通知</Text>
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: '#ddd', true: '#4CAF50' }}
                  thumbColor="#fff"
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
              onPress={handleUpdateProfile}
            >
              <Text style={styles.modalSaveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ログアウト確認モーダル */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.logoutModalOverlay}>
          <View style={styles.logoutModalContainer}>
            <Text style={styles.logoutModalTitle}>ログアウト</Text>
            <Text style={styles.logoutModalText}>
              本当にログアウトしますか？
            </Text>
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity
                style={styles.logoutModalCancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.logoutModalCancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutModalConfirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutModalConfirmButtonText}>ログアウト</Text>
              </TouchableOpacity>
            </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 10,
  },
  profileSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: '#4CAF50',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statsSection: {
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
  menuSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  logoutButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
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
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    margin: 20,
    alignItems: 'center',
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  logoutModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  logoutModalCancelButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoutModalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutModalConfirmButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f44336',
  },
  logoutModalConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
