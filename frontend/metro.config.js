const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// アセット拡張子の設定
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg');

// プラットフォーム固有の解決を有効化
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Webプラットフォームのサポートを最適化
config.resolver.alias = {
  'react-native$': 'react-native-web'
};

// Metro 0.80+ の互換性設定
config.resolver.unstable_enableSymlinks = false;

// トランスフォーマーの設定を最適化
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Hermesエンジンとの互換性向上
config.transformer.enableBabelRCLookup = false;

// エラーハンドリングの強化
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

// キャッシュの最適化
config.cacheStores = [];

module.exports = config;
