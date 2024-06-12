import eslintConfig from '@flow97/eslint-config-react'

export default [].concat([
  eslintConfig,
  {
    ignores: ['lib/*', 'locales/*'],
  },
])
