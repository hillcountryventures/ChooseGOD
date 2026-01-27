module.exports = function (api) {
  api.cache(true);
  
  const plugins = ['react-native-reanimated/plugin'];
  
  // Strip console.* in production (keep console.error for crash debugging)
  if (process.env.NODE_ENV === 'production') {
    plugins.push(['transform-remove-console', { exclude: ['error'] }]);
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
