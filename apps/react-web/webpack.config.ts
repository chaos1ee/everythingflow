import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import webpack from 'webpack'

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, './src'),
  entry: {
    app: './main.tsx',
  },
  resolve: {
    extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.mts', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  devServer: {
    open: true,
    hot: true,
    historyApiFallback: {
      index: '/',
      disableDotRule: true,
    },
    client: {
      overlay: false,
      progress: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
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
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
      title: 'React Web',
      // 防止刷新时出现 404 错误
      publicPath: '/',
      base: '/',
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, './tsconfig.json'),
      },
    }),
  ],
  experiments: {
    topLevelAwait: true,
  },
}
