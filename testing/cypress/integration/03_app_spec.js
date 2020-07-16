describe( 'scenario involving changing quantities', () => {

    before( () => {

        cy.resetMicro();

    });

    it( 'user logins, adds to cart, changes quantites, completes purchase', () => {

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
        // - 3 buttons * cart_action_event (add to cart)
        //   - selects quantity - adds to cart
        cy.get( '[test-id=shop-select-quant-1]' ).select( '3' );
        cy.get( '[test-id=add-btn-1]' ).click( {} );


        //   - selects quantity - adds to cart
        cy.get( '[test-id=shop-select-quant-2]' ).select( '2' );
        cy.get( '[test-id=add-btn-2]' ).click( {} );

        //   - adds to cart
        cy.get( '[test-id=add-btn-3]' ).click( {} );

        //   - changes quantity from within cart
        cy.get( '[test-id=cart-change-quant-1]' )
            .clear()
            .type( '2' );


        // EVENTS: +2: (1 * ue + 1 * pv)
        // - 1.purchase_event
        // - 2.pageview of thanks.html
        cy.get('.btn-purchase').click();

    });

});
