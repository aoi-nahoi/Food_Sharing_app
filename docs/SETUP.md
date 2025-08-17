# フードロス削減アプリ セットアップ手順書

## 前提条件

以下のソフトウェアがインストールされている必要があります：

- **Node.js** (v18以上)
- **npm** または **yarn**
- **Java** (JDK 17以上)
- **Maven** (3.6以上)
- **Docker** と **Docker Compose**
- **PostgreSQL** (PostGIS対応)

## 1. プロジェクトのクローンとセットアップ

```bash
# プロジェクトをクローン
git clone <repository-url>
cd food_loss_app

# 依存関係のインストール
npm install
```

## 2. データベースのセットアップ

### 方法1: Docker Composeを使用（推奨）

```bash
# PostgreSQL + PostGIS + Redis + pgAdminを起動
docker-compose up -d

# ログの確認
docker-compose logs -f postgres
```

### 方法2: 手動でPostgreSQLをセットアップ

```bash
# PostgreSQLにログイン
psql -U postgres

# データベース作成
CREATE DATABASE food_loss_db;

# PostGIS拡張の有効化
\c food_loss_db
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

# 初期化スクリプトの実行
\i database/init.sql
```

## 3. バックエンド（Spring Boot）のセットアップ

```bash
cd backend

# Maven依存関係のダウンロード
./mvnw dependency:resolve

# アプリケーションの起動
./mvnw spring-boot:run
```

### 環境変数の設定

`.env`ファイルを作成して以下の環境変数を設定：

```bash
# データベース設定
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/food_loss_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password

# JWT設定
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure

# メール設定（オプション）
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## 4. フロントエンド（React Native + Expo）のセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# Expo CLIのインストール（初回のみ）
npm install -g @expo/cli

# 開発サーバーの起動
npx expo start
```

### iOSシミュレーターでの実行

```bash
# iOSシミュレーターを起動
npx expo run:ios
```

### Androidエミュレーターでの実行

```bash
# Androidエミュレーターを起動
npx expo run:android
```

## 5. 開発環境の確認

### バックエンドAPI

- **URL**: http://localhost:8080/api
- **ヘルスチェック**: http://localhost:8080/api/health
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html

### データベース管理

- **pgAdmin**: http://localhost:5050
  - メール: admin@foodloss.com
  - パスワード: admin

### データベース接続情報

- **ホスト**: localhost
- **ポート**: 5432
- **データベース**: food_loss_db
- **ユーザー**: postgres
- **パスワード**: password

## 6. テストデータの確認

初期化スクリプトにより、以下のテストデータが作成されます：

### テストユーザー
- **一般ユーザー**: test@example.com / password
- **店舗ユーザー**: store@example.com / password

### テスト店舗
- **サンプルベーカリー**: 東京都渋谷区1-1-1

### テスト食品
- **クロワッサン**: 200円 → 100円（1日後期限）
- **食パン**: 300円 → 150円（2日後期限）

## 7. トラブルシューティング

### よくある問題と解決方法

#### データベース接続エラー

```bash
# PostgreSQLサービスの状態確認
docker-compose ps postgres

# ログの確認
docker-compose logs postgres

# サービス再起動
docker-compose restart postgres
```

#### ポート競合

```bash
# 使用中のポートを確認
netstat -tulpn | grep :8080
netstat -tulpn | grep :5432

# 競合するプロセスを停止
sudo kill -9 <PID>
```

#### Expo接続エラー

```bash
# Expo CLIのキャッシュクリア
npx expo start --clear

# ネットワーク設定の確認
npx expo start --tunnel
```

## 8. 開発のベストプラクティス

### コードフォーマット

```bash
# バックエンド（Java）
./mvnw spring-javaformat:apply

# フロントエンド（TypeScript）
npm run format
```

### テストの実行

```bash
# バックエンドテスト
./mvnw test

# フロントエンドテスト
npm test
```

### データベースマイグレーション

```bash
# スキーマの更新
./mvnw flyway:migrate

# データのリセット
./mvnw flyway:clean flyway:migrate
```

## 9. 本番環境へのデプロイ

### 環境変数の設定

```bash
# 本番用の環境変数
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL=jdbc:postgresql://prod-host:5432/food_loss_db
export DATABASE_USERNAME=prod_user
export DATABASE_PASSWORD=prod_password
export JWT_SECRET=your-production-jwt-secret
```

### Dockerイメージのビルド

```bash
# バックエンド
docker build -t food-loss-backend ./backend

# フロントエンド
docker build -t food-loss-frontend ./frontend
```

## 10. サポートとドキュメント

- **API仕様書**: `/api/swagger-ui.html`
- **データベース設計**: `database/README.md`
- **フロントエンド設計**: `frontend/README.md`
- **トラブルシューティング**: `docs/TROUBLESHOOTING.md`

## 11. 次のステップ

1. **機能開発**: 要件定義に基づく機能の実装
2. **テスト**: 単体テスト・統合テストの作成
3. **CI/CD**: GitHub Actions等での自動化
4. **監視**: ログ・メトリクスの収集
5. **セキュリティ**: 脆弱性スキャン・セキュリティテスト
