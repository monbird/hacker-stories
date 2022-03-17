/* eslint-disable no-undef */
describe('App E2E test1', () => {
    it('should assert that true is equal to true', () => {
        expect(true).to.equal(true);
    });
});

describe('App E2E test2', () => {
    it('should have a heade & label', () => {
        cy.visit('/');

        cy.get('h1').contains(/My Hacker Stories/);
        cy.get('label').contains('Search:');
    });
});
