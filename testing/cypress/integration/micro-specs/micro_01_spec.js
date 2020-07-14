context( 'testing 01_micro_spec', () => {

    // noBadEvents
    it( 'asserts no bad events', () => {

        cy.noBadEvents();

    });


    // matching by eventType
    it( 'asserts number of events by eventType', () => {

        cy.eventsWithEventType( "ue", 4 );
        cy.eventsWithEventType( "pv", 2 );

    });


    // // matching unstructured events
    // it( 'assertions on unstructured events', () => {

    //     const submitFormSchema = "iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0";

    //     // different ways to assert similar things

    //     // 1. just with schema
    //     cy.eventsWithSchema( submitFormSchema, 1 );

    //     // 2. with schema and values
    //     cy.eventsWithProperties( {

    //         "schema": submitFormSchema,
    //         "values": {

    //             "elements": [{

    //                 "name": "user_email",
    //                 "value": "john.doe@fake.com",

    //             }]

    //         }

    //     }, 1 );

    //     // 3. also without the schema key in event_options
    //     cy.eventsWithProperties( {

    //         "values": {

    //             "elements": [{

    //                 "value": "MyCity",

    //             }]

    //         }

    //     }, 1 );

    //     // 4. matching multiple input fields of a form
    //     cy.eventsWithProperties( {

    //         "schema": submitFormSchema,
    //         "values": {

    //             "elements": [
    //                 {
    //                     "name": "user_email",
    //                     "value": "john.doe@fake.com",
    //                 },
    //                 {
    //                     "name": "user_city",
    //                     "value": "MyCity"
    //                 },
    //                 {
    //                     "value":"John"
    //                 }
    //             ]
    //         }

    //     }, 1 );

    // });


    // assertion with context
    it( 'asserts webpage context in all events', () => {

        const web_page_schema = "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0";

        cy.eventsWithContexts( [ { "schema": web_page_schema } ], 6 );

    });

});
