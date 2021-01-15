'use strict'

/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require('webpack')
const path = require('path')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const env = process.env.NODE_ENV
const isTest = env === 'test'
const isProd = env === 'production'

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
  }),
  new ProgressPlugin({ profile: false }),
  new webpack.ProvidePlugin({
    process: 'process/browser',
    Buffer: ['buffer', 'Buffer'],
  }),
]

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: isTest ? 'source-map' : 'eval',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins,
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.json', '.ts', '.tsx'],
    fallback: {
      assert: 'assert-browserify',
      fs: false,
      os: false,
      path: 'path-browserify',
      constants: 'constants-browserify',
    },
  },
  node: {},
  module: {
    rules: [
      {
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
        },
        test: /\.js$/,
      },
      {
        test: /node_modules\/yaml\/browser\/dist\/.*/,
        type: 'javascript/auto',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
          plugins: [],
          presets: [
            [
              '@babel/preset-env',
              process.env.BABEL_ENV === 'es5'
                ? { forceAllTransforms: true }
                : { targets: { browsers: 'last 2 versions' } },
            ],
            '@babel/preset-react',
            ['@babel/preset-typescript', { allowDeclareFields: true }],
          ],
        },
        test: /\.tsx?$/,
      },
    ],
  },
}

if (!isTest) {
  module.exports.entry = ['@babel/polyfill', './src/index.tsx']
  module.exports.devServer = {
    port: 3000,
    contentBase: __dirname,
  }
}
