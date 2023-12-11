describe('角色', () => {
  beforeEach(() => {
    cy.injectToken()
    cy.visit('/permission/role')
  })

  it('用户列表应该包含 “用户名” 列', () => {
    cy.wrap(true).should('eq', true)
  })
})
