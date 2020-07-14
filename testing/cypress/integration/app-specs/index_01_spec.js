describe( 'first test', () => {

    it( 'just visits index', () => {

        cy.visit( "" );

    });

    it( 'adds to cart', () => {

        cy.get('.shop-item-button').click({multiple:true});

        cy.get('.btn-purchase').click( { force:true } );

    });

    it( 'fills checkout forms and submits', () => {

        cy.get('[type=submit]')
            .click();

    });

});
