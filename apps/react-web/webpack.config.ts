import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import webpack from 'webpack'

const config = {
  mode: 'development',
  context: path.resolve(__dirname, './src'),
  entry: {
    app: './main.tsx',
    'mysql.worker': 'monaco-sql-languages/out/esm/mysql/mysql.worker.js',
    'sql.worker': 'monaco-sql-languages/out/esm/sql/sql.worker.js',
  },
  output: {
    clean: true,
    asyncChunks: true,
    path: path.resolve(__dirname, './dist'),
    filename: 'static/js/[name].[contenthash].js',
    chunkFilename: 'static/js/[name].[contenthash].chunk.js',
    assetModuleFilename: 'static/assets/[name].[hash][ext]',
    // Webpack module federation 需要配置成 'auto' 不然会加载 chunk 失败
    publicPath: 'auto',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
    fallback: {
      assert: require.resolve('assert/'),
    },
  },
  devServer: {
    hot: true,
    historyApiFallback: {
      index: '/',
      disableDotRule: true,
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
      {
        test: /\.ya?ml$/,
        use: 'yaml-loader',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
      title: process.env.SITE_TITLE,
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

export default config
