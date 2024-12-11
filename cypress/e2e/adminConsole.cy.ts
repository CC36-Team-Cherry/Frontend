describe('admin console test - edit organization name', () => {
        beforeEach(() => {
            // simulate login
            cy.visit('/login');
            cy.get('input[id="username"]').type('admin@breezehr.com');
            cy.get('input[id="password"]').type('password');
            cy.get('button[data-test="login-button"]').click();
            cy.url().should('include', '/calendar');
            cy.visit('/admin');
        });
    
        it('should edit the name of the company', () => {
            const newCompanyName = 'Updated Organization Name';
            // new company name
            cy.get('[data-test="organization-name"]').should('be.visible').clear().type(newCompanyName);
            // save
            cy.get('button:contains("Save")').click();
            // Show the toast
            cy.contains('Organization name updated successfully').should('be.visible');
            // show the new name
            cy.get('h2').should('contain', newCompanyName);
        });
        
        it('should delete an existing team', () => {
                // Clicca sul pulsante "Delete"
                cy.get('button:contains("Delete")').first().click();
        
                // Verifica che il team non sia più nella lista
                cy.contains('Deleted Team Name').should('not.exist');
        });

        it('should edit an existing team name', () => {
            const updatedTeamName = 'New Team';
    
            cy.get('[data-test="edit-team"]').first().click();
    
            cy.get('[data-test="team-name-0"]').clear().type(updatedTeamName);

            // Clicca sul pulsante "Save"
            cy.get('[data-test="save-team"]').click();
    
            cy.contains(updatedTeamName).should('be.visible');
        });
});
        
    