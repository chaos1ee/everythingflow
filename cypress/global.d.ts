/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    mount: typeof mount

    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.getBySel('greeting')
     */
    getBySel(dataTestAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>

    /** Custom command to inject token. */
    injectToken(): Chainable<any>

    /**
     * Custom task to generate token.
     * @example cy.task('generateToken')
     */
    task(event: 'generateToken', arg?: any, options?: Partial<Loggable & Timeoutable>): Chainable<any>
  }
}
