describe( 'first test', () => {

    it( 'just visits index', () => {

        cy.visit( "" );

    });

    it( 'selects quantity and adds to cart', () => {

        cy.get('.shop-item-button').click({multiple:true});

        cy.get('.btn-purchase').click();

    });

    it( 'fills checkout forms and submits', () => {

        cy.get('[id=email]')
            .type('fake@email.com');

        cy.get('[id=name]')
            .type('John');

        cy.get('[id=surname]')
            .type('Doe');

        cy.get('[id=address]')
            .type('2 Second str');

        cy.get('[id=city]')
            .type('New York');

        cy.get('[id=country]')
            .type('USA');

        cy.get('[type=submit]')
            .click();

    });

     it( 'fills payment forms and submits', () => {

        cy.get('[id=card]')
             .type('VISA');

        cy.get('[id=cardNum]')
            .type('1234-5678-1234-5678');

        cy.get('[id=cvv]')
            .type('321');

        cy.get('[type=submit]')
            .click();

    });

});
