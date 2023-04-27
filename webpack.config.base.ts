import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import type { Configuration } from 'webpack'

export default {
  mode: 'production',
  target: 'web',
  devtool: 'source-map',
  output: {
    clean: true,
    asyncChunks: false,
    library: {
      type: 'module',
    },
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      util: require.resolve('util'),
      zlib: require.resolve('browserify-zlib'),
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      tty: require.resolve('tty-browserify'),
      fs: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                outputStyle: 'compressed',
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.ya?ml$/,
        use: 'yaml-loader',
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({}),
  ],
  optimization: {
    minimize: false,
  },
} as Configuration
