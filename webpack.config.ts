import * as path from 'path'
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import type { Configuration } from 'webpack'
import { merge } from 'webpack-merge'
import baseConfig from './webpack.config.base'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import * as fs from 'fs'

function buildConfigs(opts: {
  name: string
  packageDir: string
  entryFile: string
  useTypescript?: boolean
  outputPath?: string
  externals?: Record<string, string>
  experiments?: Configuration['experiments']
}) {
  const { packageDir, entryFile, useTypescript, outputPath, ...restOpts } = opts
  const entry = path.resolve(packageDir, entryFile)

  const output = {
    path: path.resolve(packageDir, outputPath || 'dist'),
    publicPath: path.resolve(packageDir, outputPath || 'dist'),
  }

  const resolve = {
    plugins: [],
  }

  const module = {
    rules: [],
  }

  if (useTypescript) {
    const tsconfigPath = path.resolve(packageDir, 'tsconfig.json')

    try {
      fs.accessSync(tsconfigPath, fs.constants.R_OK)

      resolve.plugins.push(
        new TsconfigPathsPlugin({
          configFile: tsconfigPath,
          logLevel: 'INFO',
        }),
      )

      module.rules.push({
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: false,
          configFile: tsconfigPath,
        },
        exclude: /node_modules/,
      })
    } catch (err) {
      throw new Error(`tsconfig.json doesn't exist in package directory: ${tsconfigPath}.`)
    }
  }

  const plugins = [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash].css',
      chunkFilename: 'static/css/[name].[contenthash].chunk.css',
    }),
  ]

  return merge<Configuration>(baseConfig, {
    ...restOpts,
    entry,
    output,
    resolve,
    plugins,
    module,
  })
}

const configs = [
  buildConfigs({
    name: 'react-toolkits',
    entryFile: 'src/index.ts',
    outputPath: 'dist',
    useTypescript: true,
    packageDir: './packages/react-toolkits',
    experiments: {
      outputModule: true,
      topLevelAwait: true,
    },
  }),
]

export default configs
