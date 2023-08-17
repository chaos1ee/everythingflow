const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, './src'),
  entry: {
    app: './main.tsx',
    'mysql.worker': 'monaco-sql-languages/out/esm/mysql/mysql.worker.js',
    'sql.worker': 'monaco-sql-languages/out/esm/sql/sql.worker.js',
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
