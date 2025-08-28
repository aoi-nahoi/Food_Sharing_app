# フードロス削減アプリ - 要件定義書

## 1. プロジェクト概要
余剰食品を効率的に販売・購入できるプラットフォームアプリです。店舗は余剰食品を掲載し、一般ユーザーは近くのお店の余剰食品を見つけて予約・購入できます。

### 1.1 目的
余剰食品を効率的に販売・購入できるプラットフォームアプリを提供し、食品廃棄の削減と食品の有効活用を促進する。

### 1.2 対象ユーザー
- **一般ユーザー**: 割引された食品を購入したい消費者
- **店舗オーナー**: 余剰食品を販売したい小売店・飲食店
- **管理者**: システム全体の管理・運営者

### 1.3 主要機能
- ユーザー認証・管理システム
- 店舗登録・管理機能
- 余剰食品の掲載・管理
- 位置情報ベースの店舗検索
- 食品予約・購入システム
- 通知システム

## 2. 機能要件

### 2.1 認証・ユーザー管理
- ユーザー登録・ログイン・ログアウト
- プロフィール編集・管理
- ロールベースアクセス制御（USER, STORE, ADMIN）
- JWT認証によるセッション管理

### 2.2 店舗機能
- 店舗登録・プロフィール管理
- 店舗情報編集（営業時間、住所、位置情報）
- 店舗認証システム

### 2.3 食品管理
- 余剰食品の掲載・編集・削除
- カテゴリ別分類（パン・菓子、野菜・果物、乳製品、肉・魚、惣菜・弁当、飲料、その他）
- 価格設定（原価・割引価格）
- 在庫管理・数量管理
- 賞味期限管理
- 画像アップロード

### 2.4 検索・閲覧機能
- 位置情報ベースの店舗検索
- カテゴリ別食品検索
- 価格帯・距離による絞り込み
- 地図表示・店舗位置表示

### 2.5 購入・予約機能
- ショッピングカート機能
- 注文作成・管理
- 注文ステータス管理（PENDING, CONFIRMED, READY, COMPLETED, CANCELLED）
- 受け取り時間指定

### 2.6 通知システム
- 注文状況の通知
- 新商品・割引情報の通知
- プッシュ通知対応

## 3. 技術要件

### 3.1 フロントエンド
- **フレームワーク**: React Native 0.76.3 + Expo 53.0.0
- **言語**: TypeScript 5.3.0
- **状態管理**: Redux Toolkit + React Redux
- **ナビゲーション**: React Navigation 6.x
- **地図**: React Native Maps 1.10.0
- **位置情報**: Expo Location
- **カメラ・画像**: Expo Camera, Expo Image Picker
- **セキュリティ**: Expo Secure Store
- **通知**: Expo Notifications

### 3.2 バックエンド
- **フレームワーク**: Spring Boot 3.1.5
- **言語**: Java 17
- **セキュリティ**: Spring Security
- **データアクセス**: Spring Data JPA + Hibernate
- **認証**: JWT (JSON Web Token)
- **バリデーション**: Spring Validation
- **メール**: Spring Mail (SMTP)
- **ファイルアップロード**: Commons FileUpload
- **地理情報**: PostGIS + JTS Core

### 3.3 データベース
- **メインDB**: PostgreSQL 15 + PostGIS 3.3
- **キャッシュ**: Redis 7
- **管理ツール**: pgAdmin 4

### 3.4 インフラ・デプロイ
- **コンテナ化**: Docker + Docker Compose
- **環境管理**: 開発・本番環境分離
- **ロードバランサー**: 対応予定

## 4. プロジェクト構造

```
food_loss_app/
├── frontend/                          # React Native + Expo アプリ
│   ├── src/
│   │   ├── screens/                   # 画面コンポーネント
│   │   │   ├── auth/                  # 認証関連画面
│   │   │   │   ├── LoginScreen.tsx    # ログイン画面
│   │   │   │   └── RegisterScreen.tsx # 登録画面
│   │   │   ├── main/                  # メイン画面
│   │   │   │   ├── HomeScreen.tsx     # ホーム画面
│   │   │   │   ├── FoodListScreen.tsx # 食品一覧画面
│   │   │   │   ├── MapScreen.tsx      # 地図画面
│   │   │   │   └── ProfileScreen.tsx  # プロフィール画面
│   │   │   ├── store/                 # 店舗関連画面
│   │   │   │   ├── StoreRegisterScreen.tsx # 店舗登録画面
│   │   │   │   ├── StoreProfileScreen.tsx  # 店舗プロフィール画面
│   │   │   │   └── FoodPostScreen.tsx      # 食品投稿画面
│   │   │   └── common/                # 共通画面
│   │   │       ├── CartScreen.tsx     # カート画面
│   │   │       └── FoodDetailScreen.tsx    # 食品詳細画面
│   │   ├── services/                  # API通信サービス
│   │   │   └── api.ts                 # API設定・通信
│   │   ├── store/                     # Redux状態管理
│   │   │   ├── slices/                # Reduxスライス
│   │   │   │   ├── authSlice.ts       # 認証状態
│   │   │   │   ├── cartSlice.ts       # カート状態
│   │   │   │   ├── foodSlice.ts       # 食品状態
│   │   │   │   ├── locationSlice.ts   # 位置情報状態
│   │   │   │   └── storeSlice.ts      # 店舗状態
│   │   │   └── store.ts               # Reduxストア設定
│   │   └── config.ts                  # アプリ設定
│   ├── package.json                   # 依存関係
│   └── App.tsx                        # メインアプリ
├── backend/                           # Spring Boot バックエンド
│   ├── src/main/java/com/foodloss/
│   │   ├── config/                    # 設定クラス
│   │   │   └── SecurityConfig.java    # セキュリティ設定
│   │   ├── controller/                # REST API コントローラー
│   │   │   └── AuthController.java    # 認証API
│   │   ├── dto/                       # データ転送オブジェクト
│   │   │   ├── AuthRequest.java       # 認証リクエスト
│   │   │   ├── AuthResponse.java      # 認証レスポンス
│   │   │   ├── RegisterRequest.java   # 登録リクエスト
│   │   │   └── UserProfileRequest.java # プロフィールリクエスト
│   │   ├── entity/                    # エンティティクラス
│   │   │   ├── BaseEntity.java        # 基底エンティティ
│   │   │   ├── User.java              # ユーザーエンティティ
│   │   │   ├── Store.java             # 店舗エンティティ
│   │   │   ├── Food.java              # 食品エンティティ
│   │   │   ├── Category.java          # カテゴリエンティティ
│   │   │   ├── CartItem.java          # カートアイテムエンティティ
│   │   │   └── Order.java             # 注文エンティティ
│   │   ├── repository/                # データアクセス層
│   │   │   ├── UserRepository.java    # ユーザーリポジトリ
│   │   │   └── FoodRepository.java    # 食品リポジトリ
│   │   ├── service/                   # ビジネスロジック層
│   │   │   ├── AuthService.java       # 認証サービス
│   │   │   └── JwtService.java        # JWTサービス
│   │   └── FoodLossApplication.java   # メインアプリケーション
│   ├── src/main/resources/
│   │   └── application.yml            # アプリケーション設定
│   └── pom.xml                        # Maven設定
├── database/                          # データベース関連
│   └── init.sql                       # 初期化スクリプト
├── docker-compose.yml                 # Docker Compose設定
└── docs/                              # ドキュメント
    └── SETUP.md                       # セットアップ手順
```

## 5. データベース設計

### 5.1 主要テーブル
- **users**: ユーザー情報（ID、メール、パスワード、名前、ロール、アバター等）
- **stores**: 店舗情報（ID、ユーザーID、店舗名、説明、住所、位置情報、営業時間等）
- **food_categories**: 食品カテゴリ（ID、名前、説明、アイコン）
- **foods**: 食品情報（ID、店舗ID、カテゴリID、名前、説明、価格、数量、賞味期限等）
- **cart_items**: カートアイテム（ID、ユーザーID、食品ID、数量）
- **orders**: 注文情報（ID、ユーザーID、店舗ID、合計金額、ステータス、受け取り時間等）
- **order_items**: 注文詳細（ID、注文ID、食品ID、数量、単価、合計価格）
- **notifications**: 通知情報（ID、ユーザーID、タイトル、メッセージ、タイプ、既読状態等）

### 5.2 空間データ
- PostGIS拡張を使用した位置情報管理
- 店舗の緯度・経度情報の保存
- 空間インデックスによる高速検索

## 6. 起動・セットアップ手順

### 6.1 前提条件
- Docker & Docker Compose
- Node.js 18+ & npm
- Java 17+ & Maven

### 6.2 データベース起動
```bash
# PostgreSQL + PostGIS + Redis + pgAdmin の起動
docker-compose up -d postgres redis pgadmin

# データベースの初期化確認
docker-compose logs postgres
```

### 6.3 バックエンド起動
```bash
# Spring Boot アプリケーションの起動
cd backend
./mvnw spring-boot:run

# または Docker で起動
docker-compose up -d backend
```

### 6.4 フロントエンド起動
```bash
# 依存関係のインストール
cd frontend
npm install

# Expo 開発サーバーの起動
npm start
# または
npx expo start

# プラットフォーム別起動
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

### 6.5 環境変数設定
```bash
# バックエンド環境変数
export JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-secure"
export MAIL_USERNAME="your-email@gmail.com"
export MAIL_PASSWORD="your-app-password"

# フロントエンド環境変数
# src/config.ts で設定
```

## 7. API エンドポイント

### 7.1 認証関連
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ユーザーログイン
- `POST /api/auth/refresh` - トークン更新

### 7.2 ユーザー管理
- `GET /api/users/profile` - プロフィール取得
- `PUT /api/users/profile` - プロフィール更新

### 7.3 店舗管理
- `POST /api/stores` - 店舗登録
- `GET /api/stores` - 店舗一覧取得
- `GET /api/stores/{id}` - 店舗詳細取得
- `PUT /api/stores/{id}` - 店舗情報更新

### 7.4 食品管理
- `POST /api/foods` - 食品登録
- `GET /api/foods` - 食品一覧取得
- `GET /api/foods/{id}` - 食品詳細取得
- `PUT /api/foods/{id}` - 食品情報更新
- `DELETE /api/foods/{id}` - 食品削除

### 7.5 注文管理
- `POST /api/orders` - 注文作成
- `GET /api/orders` - 注文一覧取得
- `PUT /api/orders/{id}/status` - 注文ステータス更新

## 8. セキュリティ要件

### 8.1 認証・認可
- JWT トークンによる認証
- ロールベースアクセス制御
- パスワードのハッシュ化（BCrypt）

### 8.2 データ保護
- HTTPS通信の強制
- SQLインジェクション対策
- XSS対策
- CSRF対策

### 8.3 ファイルアップロード
- ファイルタイプ制限
- ファイルサイズ制限（10MB）
- セキュアなファイル保存

## 9. パフォーマンス要件

### 9.1 レスポンス時間
- API レスポンス: 500ms以下
- 画像読み込み: 2秒以下
- 地図表示: 1秒以下

### 9.2 スケーラビリティ
- 同時接続ユーザー: 1000人以上
- データベース接続プール: 20-50接続
- Redis キャッシュによる高速化

## 10. 開発・運用要件

### 10.1 開発環境
- コード品質: ESLint, Prettier
- テスト: Jest, Spring Boot Test
- バージョン管理: Git

### 10.2 ログ・監視
- アプリケーションログ
- セキュリティログ
- パフォーマンス監視

### 10.3 バックアップ・復旧
- データベース定期バックアップ
- ファイルストレージバックアップ
- 障害復旧手順

## 11. 今後の拡張予定

### 11.1 短期（3ヶ月以内）
- 決済システム統合
- プッシュ通知機能
- 評価・レビューシステム

### 11.2 中期（6ヶ月以内）
- AI による食品推薦
- 在庫予測システム
- 多言語対応

### 11.3 長期（1年以内）
- モバイルアプリ（iOS/Android）
- 店舗向け管理ダッシュボード
- データ分析・レポート機能
