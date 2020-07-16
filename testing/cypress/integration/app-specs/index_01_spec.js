describe( 'simple scenario', () => {

    it( 'user logins, adds to cart, completes purchase', () => {

        // EVENTS: +1: (1 * pv)
        // - pageView of start.html
        cy.visit( "" );  // baseUrl

        // EVENTS: +4: (3 * ue + 1 * pv)
        // - 1.focus_form for email
        // - 2.change_form for email
        // - 3.submit_form
        // - 4.pageView for index.html
        cy.get( '[test-id=email-input]' )
            .type( 'fake@email.com' );

        cy.get( '[test-id=password-input]' )
            .type( 'fake0password' );

        cy.get( '[test-id=submit-button]' )
            .click();

        // EVENTS: +3: (3 * ue)
        // - 3 buttons * cart_action_event
        cy.get( '[test-id=add-btn-1]' ).click( {} );
        cy.get( '[test-id=add-btn-2]' ).click( {} );
        cy.get( '[test-id=add-btn-3]' ).click( {} );

        // EVENTS: +2: (1 * ue + 1 * pv)
        // - 1.purchase_event
        // - 2.pageview of thanks.html
        cy.get('.btn-purchase').click( { force:true } );

    });

});
