# フードロス削減アプリ

## 概要
余剰食品を効率的に販売・購入できるプラットフォームアプリです。店舗は余剰食品を掲載し、一般ユーザーは近くのお店の余剰食品を見つけて予約・購入できます。

## 技術スタック
- **フロントエンド**: React Native + Expo
- **バックエンド**: Java Spring Boot
- **データベース**: PostgreSQL + PostGIS
- **認証**: JWT
- **地図**: Google Maps API / Mapbox

## プロジェクト構造
```
food_loss_app/
├── frontend/          # React Native + Expo アプリ
├── backend/           # Spring Boot バックエンド
├── database/          # データベーススクリプト
└── docs/             # ドキュメント
```

## セットアップ手順

### 1. フロントエンド（React Native + Expo）
```bash
cd frontend
npm install
npx expo start
```

### 2. バックエンド（Spring Boot）
```bash
cd backend
./mvnw spring-boot:run
```

### 3. データベース（PostgreSQL + PostGIS）
```bash
cd database
# PostgreSQLとPostGISのセットアップ手順を参照
```

## 機能一覧
- 👤 ユーザー管理（登録・ログイン・プロフィール編集）
- 🏪 店舗機能（店舗登録・食品掲載・編集・削除）
- 🍞 ユーザー機能（食品一覧・詳細・予約・履歴）
- 📍 位置情報機能（現在地検索・地図表示）

## 開発ロードマップ
1. ユーザー認証機能
2. 店舗登録・余剰食品投稿
3. 食品一覧閲覧
4. 位置情報検索
5. 予約機能
