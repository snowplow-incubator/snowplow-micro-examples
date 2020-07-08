context( 'testing 01_micro_spec', () => {

    it( 'asserts no bad events', () => {

        cy.noBadEvents();

    });


    it( 'asserts number events by eventType', () => {

        cy.eventsWithEventType( "pv", 1 );

    });

});
