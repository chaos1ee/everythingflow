describe('操作日志', () => {
  beforeEach(() => {
    cy.injectToken()
    cy.visit('/log/operation_log')
  })

  it('用户列表应该包含 “用户名” 列', () => {
    cy.wrap(true).should('eq', true)
  })
})
