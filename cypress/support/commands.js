// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })


import * as Micro from '../../jsm/helpers.js';

const ALL = Cypress.env( 'SNOWPLOW_MICRO_URI' ) + Cypress.env( 'MICRO_ALL' );
const GOOD = Cypress.env( 'SNOWPLOW_MICRO_URI' ) + Cypress.env( 'MICRO_GOOD' );
const BAD = Cypress.env( 'SNOWPLOW_MICRO_URI' ) + Cypress.env( 'MICRO_BAD' );
const RESET = Cypress.env( 'SNOWPLOW_MICRO_URI' ) + Cypress.env( 'MICRO_RESET' );


// request with json:true
Cypress.Commands.add( 'requestJson', ( myurl ) => {

    cy.request( {
        url: myurl,
        json: true
    });

});


// reset micro
Cypress.Commands.add( 'resetMicro', () => {

    cy.request( RESET );

});


// noBadEvents
Cypress.Commands.add( 'noBadEvents', () => {

    cy.requestJson( BAD )

        .then( ( $res ) => {

            expect( $res.body.length ).to.eq( 0 );
        });

});


// numGoodEvents
Cypress.Commands.add( 'numGoodEvents', ( n ) => {

    n = Micro.sane( n );

    cy.requestJson( GOOD )

        .then( ( $res ) => {

            expect( $res.body.length ).to.eq( n );

        });

});


// eventsWithSchema
Cypress.Commands.add( 'eventsWithSchema', ( schema, n = 1 ) => {

    n = Micro.sane( n );

    cy.requestJson( GOOD )

        .its( 'body' )

        .then( ( $arr ) => {

            const res = Micro.matchBySchema( $arr, schema );

            expect( res.length ).to.eq( n );

        });

});


// eventsWithEventType
Cypress.Commands.add( 'eventsWithEventType', ( eventType, n = 1 ) => {

    n = Micro.sane( n );

    cy.requestJson( GOOD )

        .its( 'body' )

        .then( ( $arr ) => {

            const res = Micro.matchByEventType( $arr, eventType );

            expect( res.length ).to.eq( n );

        });

});


// eventsWithProperties (see also lamp-store-demo-nw-tests) (maybe rename?)
Cypress.Commands.add( 'eventsWithProperties', ( event_options, n = 1 ) => {

    n = Micro.sane( n );

    cy.requestJson( GOOD )

        .its( 'body' )

        .then( ( $arr ) => {

            let res = $arr;

            if ( event_options[ "schema" ] ) {

                res = Micro.matchBySchema( res, event_options[ "schema" ] );

            }

            if ( event_options[ "values" ] ) {

                res = Micro.matchByVals( res, event_options[ "values" ] );

            }

            if ( event_options[ "contexts" ] ) {

                res = Micro.matchByContexts( res, event_options[ "contexts" ] );

            }

            if ( event_options[ "parameters" ] ) {

                res = Micro.matchByParams( res, event_options[ "parameters" ] );
            }

            expect( res.length ).to.eq( n );

        });

});


// eventsWithParams
Cypress.Commands.add( 'eventsWithParams', ( params, n = 1 ) => {

    n = Micro.sane( n );

    cy.requestJson( GOOD )

        .its( 'body' )

        .then( ( $arr ) => {

            const res = Micro.matchByParams( $arr, params );

            expect( res.length ).to.eq( n );

        });

});


// eventsWithContexts
// the first argument must be array of objects
Cypress.Commands.add( 'eventsWithContexts', ( contextsArray, n = 1 ) => {

    n = Micro.sane( n );

    cy.requestJson( GOOD )

        .its( 'body' )

        .then( ( $arr ) => {

            const res = Micro.matchByContexts( $arr, contextsArray );

            expect( res.length ).to.eq( n );
        });
});
