-- フードロス削減アプリ データベース初期化スクリプト

-- データベース作成
CREATE DATABASE food_loss_db;

-- データベースに接続
\c food_loss_db;

-- PostGIS拡張の有効化
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- スキーマ作成
CREATE SCHEMA IF NOT EXISTS public;

-- ユーザーテーブル
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'STORE', 'ADMIN')),
    avatar VARCHAR(500),
    phone_number VARCHAR(20),
    notification_settings JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 店舗テーブル
CREATE TABLE stores (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    location GEOMETRY(POINT, 4326) NOT NULL, -- PostGIS位置情報
    phone_number VARCHAR(20),
    business_hours JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 食品カテゴリテーブル
CREATE TABLE food_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 食品テーブル
CREATE TABLE foods (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES food_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    original_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    available_quantity INTEGER NOT NULL,
    image_url VARCHAR(500),
    expiry_date TIMESTAMP NOT NULL,
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- カートテーブル
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id BIGINT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, food_id)
);

-- 注文テーブル
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED')),
    pickup_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 注文詳細テーブル
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    food_id BIGINT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 通知テーブル
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_location ON stores USING GIST(location);
CREATE INDEX idx_stores_user_id ON stores(user_id);
CREATE INDEX idx_foods_store_id ON foods(store_id);
CREATE INDEX idx_foods_category_id ON foods(category_id);
CREATE INDEX idx_foods_expiry_date ON foods(expiry_date);
CREATE INDEX idx_foods_location ON foods(store_id) INCLUDE (id, name, discounted_price);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- 空間インデックス（PostGIS）
CREATE INDEX idx_stores_location_spatial ON stores USING GIST(location);

-- 基本的なカテゴリデータの挿入
INSERT INTO food_categories (name, description, icon) VALUES
('パン・菓子', 'パン、ケーキ、クッキーなどの焼き菓子', '🍞'),
('野菜・果物', '新鮮な野菜や果物', '🥬'),
('乳製品', '牛乳、チーズ、ヨーグルトなど', '🥛'),
('肉・魚', '肉類、魚介類', '🥩'),
('惣菜・弁当', '調理済みの惣菜や弁当', '🍱'),
('飲料', 'ジュース、お茶、コーヒーなど', '🥤'),
('その他', 'その他の食品', '🍽️');

-- トリガー関数の作成（updated_atの自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入（開発用）
-- テストユーザー
INSERT INTO users (email, password, name, role) VALUES
('test@example.com', '$2a$10$dummy.hash.for.testing', 'テストユーザー', 'USER'),
('store@example.com', '$2a$10$dummy.hash.for.testing', 'テスト店舗', 'STORE');

-- テスト店舗
INSERT INTO stores (user_id, store_name, description, address, location) VALUES
(2, 'サンプルベーカリー', '美味しいパンとケーキのお店', '東京都渋谷区1-1-1', ST_GeomFromText('POINT(139.7016 35.6580)', 4326));

-- テスト食品
INSERT INTO foods (store_id, category_id, name, description, original_price, discounted_price, quantity, available_quantity, expiry_date) VALUES
(1, 1, 'クロワッサン', 'バターの香り豊かなクロワッサン', 200, 100, 10, 10, CURRENT_TIMESTAMP + INTERVAL '1 day'),
(1, 1, '食パン', 'ふわふわの食パン', 300, 150, 5, 5, CURRENT_TIMESTAMP + INTERVAL '2 days');

-- 権限の設定
GRANT ALL PRIVILEGES ON DATABASE food_loss_db TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
