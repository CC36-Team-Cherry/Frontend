describe('register org test', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('button[data-test="register-button"]').click();
  });

  it('should register successfully with correct credentials', () => {
    cy.url().should('include', '/adminorg');
    //enter all fields
    const date = '1980-08-29';

    cy.get('input[data-test="reg-username"]').type(`${String(Math.random() * 1000)}@breezehr.com`);
    cy.get('input[data-test="reg-password"]').type('password');
    cy.get('input[data-test="reg-first-name"]').type('John');
    cy.get('input[data-test="reg-last-name"]').type('Doe');
    cy.get('input[data-test="reg-birthday"]').type(date);
    cy.get('input[data-test="reg-role"]').type('manager');
    cy.get('input[data-test="reg-join-date"]').type('2024-12-12');
    cy.get('input[data-test="reg-company-name"]').type('Breeze HR');
    //click register button
    cy.get('button[data-test="org-register-button"]').click();
    //verify successful login
    cy.url().should('include', '/employee');
    cy.contains(/Breeze HR/i);
  });

  it('should not register with missing fields', () => {
    cy.url().should('include', '/adminorg');
    //missing email and birthday fields
    cy.get('input[data-test="reg-password"]').type('password');
    cy.get('input[data-test="reg-first-name"]').type('John');
    cy.get('input[data-test="reg-last-name"]').type('Doe');
    cy.get('input[data-test="reg-role"]').type('manager');
    cy.get('input[data-test="reg-join-date"]').type('2024-12-12');
    cy.get('input[data-test="reg-company-name"]').type('Breeze HR');
    //click register button
    cy.get('button[data-test="org-register-button"]').click();
    //check if still on register page
    cy.url().should('include', '/adminorg');
  })
});