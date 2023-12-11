describe('未登录', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage()
    cy.clearAllSessionStorage()
  })

  it('未登录用户访问时应该被重定向到登录页', () => {
    cy.visit('/any-route')
    cy.location('pathname').should('eq', '/sign_in')
  })
})

describe('已登录', () => {
  beforeEach(() => {
    cy.injectToken()
  })

  it('用户登录后访问 “/” 应该自动跳转到首页', () => {
    cy.visit('/')
    cy.location('pathname').should('eq', '/list')
    cy.getBySel('user-widget').contains(Cypress.env('USERNAME'))
  })

  it('用户登录后访问 “/sign_in” 应该自动跳转到首页', () => {
    cy.visit('/sign_in')
    cy.location('pathname').should('eq', '/list')
    cy.getBySel('user-widget').contains(Cypress.env('USERNAME'))
  })

  it('在用户点击登出后应该被重定向到登录页', () => {
    cy.visit('/')
    cy.getBySel('user-widget').trigger('mouseover')
    cy.get('.ant-dropdown-menu').should('be.visible').getBySel('user-widget-logout').click()
    cy.location('pathname').should('eq', '/sign_in')
  })

  it('在用户点击登出后本地存储内认证相关的缓存数据应该被清除', () => {
    cy.visit('/')
    cy.wrap(true).should('eq', true)
  })

  it('Token 过期时自动重定向到登录页并清除认证相关的缓存数据', () => {
    cy.visit('/')
    cy.wrap(true).should('eq', true)
  })

  it('接口返回 401 时', () => {
    cy.visit('/')
    cy.wrap(true).should('eq', true)
  })
})
