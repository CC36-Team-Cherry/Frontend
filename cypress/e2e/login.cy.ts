describe('login test', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should log in successfully with valid credentials', () => {
    //enter email and password
    cy.get('input[id="username"]').type('admin@breezehr.com');
    cy.get('input[id="password"]').type('password');
    //click login button
    cy.get('button[data-test="login-button"]').click();
    //verify successful login
    cy.url().should('include', '/calendar');
    cy.contains(/Welcome Tim Peters/i);
  });
})