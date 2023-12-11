import { defineConfig } from 'cypress'
import { SignJWT } from 'jose'
import { SECRET } from './constants'

export default defineConfig({
  retries: {
    runMode: 2,
  },
  includeShadowDom: true,
  env: {
    USERNAME: 'hao.li',
  },
  e2e: {
    baseUrl: 'http://localhost:8000',
    specPattern: './cypress/e2e/*.spec.{js,jsx,ts,tsx}',
    supportFile: './cypress/support/e2e.ts',
    viewportHeight: 1000,
    viewportWidth: 1280,
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      on('task', {
        async generateToken() {
          return await new SignJWT({
            authorityId: config.env.USERNAME,
          })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('12h')
            .sign(SECRET)
        },
      })
    },
  },
})
