import path from 'path'
import type { Configuration } from 'mini-css-extract-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const config: Configuration = {
  mode: 'production',
  target: 'web',
  devtool: 'cheap-module-source-map',
  entry: './src/index.ts',
  output: {
    clean: true,
    path: path.resolve(__dirname, './dist'),
    filename: 'index.mjs',
    library: {
      type: 'module',
      export: ['default', 'subModule'],
    },
  },
  externals: {
    react: {
      module: 'react',
    },
    antd: {
      module: 'antd',
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
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
        test: /\.tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
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
  optimization: {
    minimize: false,
  },
  experiments: {
    outputModule: true,
    topLevelAwait: true,
  },
}

export default config
