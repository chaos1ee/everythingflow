import * as path from 'path'
import * as fs from 'fs'
import type { Configuration } from 'webpack'
import { merge } from 'webpack-merge'
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'
import baseConfig from './webpack.config.base'

interface BuildConfigsOptions extends Pick<Configuration, 'externals' | 'experiments'> {
  name: string
  packageDir: string
  entryFile: string
  useTypescript?: boolean
  outputPath?: string
}

function buildConfigs(opts: BuildConfigsOptions) {
  const { packageDir, entryFile, useTypescript, outputPath, ...restOpts } = opts
  const entry = path.resolve(packageDir, entryFile)

  const resolve = {
    plugins: [],
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
    } catch (err) {
      throw new Error(`tsconfig.json doesn't exist in package directory: ${tsconfigPath}.`)
    }
  }

  return merge<Configuration>(baseConfig, {
    ...restOpts,
    entry,
    output: {
      path: path.resolve(packageDir, outputPath || 'dist'),
    },
    resolve,
  })
}

const configs = [
  buildConfigs({
    name: 'react-toolkits',
    entryFile: 'src/index.ts',
    outputPath: 'dist',
    useTypescript: true,
    packageDir: './packages/react-toolkits',
    externals: ['react', 'react-dom', 'react-router-dom'],
  }),
]

export default configs
