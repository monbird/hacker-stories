/* eslint-disable no-undef */
describe('App E2E test1', () => {
    it('should assert that true is equal to true', () => {
        expect(true).to.equal(true);
    });
});

describe('App E2E test2', () => {
    it('should have a header', () => {
        cy.visit('/');

        cy.get('h1').should('have.text', 'My Hacker Stories');
    });
});
