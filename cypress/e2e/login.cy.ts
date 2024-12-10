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

  it('should display an error message with invalid credentials', () => {
    //invalid email and password
    cy.get('input[id="username"]').type('invalid@breezehr.com');
    cy.get('input[id="password"]').type('wrongpassword');
    cy.get('button[data-test="login-button"]').click();
    cy.contains('Invalid username/password').should('be.visible');
  });
})