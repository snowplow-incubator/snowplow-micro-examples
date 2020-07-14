describe( 'first test', () => {

    it( 'visits index, adds to cart, clicks purchase', () => {

        // EVENTS: +1 (pageview)
        cy.visit( "/index" );

        // EVENTS: +3 (cart_event from 3 buttons)
        cy.get( '[test-id=add-btn-1]' ).click( {} );
        cy.get( '[test-id=add-btn-2]' ).click( {} );
        cy.get( '[test-id=add-btn-3]' ).click( {} );

        // EVENTS: +2 (1.purchase 2.pageview of thanks.html)
        cy.get('.btn-purchase').click( { force:true } );

    });

});
