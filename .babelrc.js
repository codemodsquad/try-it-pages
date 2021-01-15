module.exports = function(api) {
  const plugins = []
  const presets = [
    [
      '@babel/preset-env',
      api.env('es5')
        ? { forceAllTransforms: true }
        : { targets: { node: 'current' } },
    ],
    ['@babel/preset-typescript', { allowDeclareFields: true }],
    '@babel/preset-react',
  ]

  if (api.env(['test', 'coverage', 'es5'])) {
    plugins.push('@babel/plugin-transform-runtime')
  }
  if (api.env('coverage')) {
    plugins.push('babel-plugin-istanbul')
  }

  return { plugins, presets }
}
