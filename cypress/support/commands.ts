// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args)
})

Cypress.Commands.add('injectToken', () => {
  return cy.task('generateToken').then(token => {
    cy.window().then(win => {
      win.localStorage.setItem('token', JSON.stringify({ state: { token }, version: 0 }))
    })
  })
})
