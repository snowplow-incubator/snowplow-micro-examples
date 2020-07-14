describe( 'first test', () => {

    it( 'just visits index', () => {

        // EVENTS: +1 (pageview)
        cy.visit( "/index" );

    });

    it( 'adds to cart', () => {

        // EVENTS: +3 (addToCart from 3 buttons)
        cy.get( '[test-id=add-btn-1]' ).click( {} );
        cy.get( '[test-id=add-btn-2]' ).click( {} );
        cy.get( '[test-id=add-btn-3]' ).click( {} );

        // EVENTS: +1 (submit leads to pageview of thanks.html)
        cy.get('.btn-purchase').click( { force:true } );

    });

});
