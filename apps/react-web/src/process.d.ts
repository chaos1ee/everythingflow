declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    SITE_TITLE: string
    ENABLE_MOCK: '0' | '1'
    BASE_URL: string
  }
}
