module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        jsxImportSource: 'react',
        runtime: 'automatic'
      }]
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
    env: {
      development: {
        compact: false
      },
      production: {
        compact: true
      }
    }
  };
};
