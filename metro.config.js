const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {
    wrapWithReanimatedMetroConfig,
  } = require('react-native-reanimated/metro-config');
/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// Lấy cấu hình mặc định
const defaultConfig = getDefaultConfig(__dirname);
// Chỉnh sửa cấu hình để hỗ trợ SVG
defaultConfig.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg');
defaultConfig.resolver.sourceExts.push('svg');

// Bọc với cấu hình của reanimated
const config = wrapWithReanimatedMetroConfig(
  mergeConfig(defaultConfig, {
    projectRoot: __dirname,
  })
);

module.exports = config;
