context( 'testing 01_micro_spec', () => {

    // noBadEvents
    it( 'asserts no bad events', () => {

        cy.noBadEvents();

    });


    // matching by eventType
    it( 'asserts number of unstructured events by eventType', () => {

        cy.eventsWithEventType( "ue", 13 );

    });


    // matching unstructured events
    it( 'assertions on unstructured events', () => {

        const changeFormSchema = "iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0";
        const submitFormSchema = "iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0";

        // different ways to assert similar things

        // 1. just with schema
        cy.eventsWithSchema( changeFormSchema, 6 );

        // 2. with schema and values
        cy.eventsWithProperties( {

            "schema": submitFormSchema,
            "values": {

                "elements": [{

                    "name": "user_email",
                    "value": "fake@email.com",

                }]

            }

        }, 1 );

        // 3. also without the schema key in event_options
        cy.eventsWithProperties( {

            "values": {

                "elements": [{

                    "value": "New York",

                }]

            }

        }, 1 );

        // 4. matching multiple input fields of a form
        cy.eventsWithProperties( {

            "schema": submitFormSchema,
            "values": {

                "elements": [
                    {
                        "name": "user_email",
                        "value": "fake@email.com",
                    },
                    {
                        "name": "user_city",
                        "value": "New York"
                    },
                    {
                        "value":"John"
                    }
                ]
            }

        }, 1 );

    });


    // assertion with context
    it( 'asserts webpage context in all events', () => {

        const web_page_schema = "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0";

        cy.eventsWithContexts( [ { "schema": web_page_schema } ], 15 );

    });

});
