import sharedconfig from '@flow97/eslint-config-react'

export default [
  sharedconfig,
  {
    ignores: ['dist/*', 'public/*'],
  },
]
