context( 'testing events from 01_app_spec.js', () => {

    // noBadEvents
    it( 'asserts no bad events', () => {

        cy.noBadEvents();

    });


    // matching by eventType
    it( 'asserts number of events by eventType', () => {

        cy.eventsWithEventType( "ue", 7 );
        cy.eventsWithEventType( "pv", 3 );

    });


    // checking form events
    it( 'assertions on form events', () => {


        const focusFormSchema = "iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0";
        const changeFormSchema = "iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0";
        const submitFormSchema = "iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0";


        // different ways to assert similar things

        // 1. just with schema
        cy.eventsWithSchema( submitFormSchema, 1 );

        // 2. with schema and values
        cy.eventsWithProperties( {

            "schema": changeFormSchema,
            "values": {
                "type": "email",
                "value": "fake@email.com",
            }

        }, 1 );

        // 3. also without the schema key in event_options
        // NOTE: we are expecting this to match only with focus_form and change_form events
        //       and not with the submit_form one.
        //       The reason is that the submit_form schema,
        //       wraps the inputs' values in an array ("elements"). See below.
        cy.eventsWithProperties( {

            "values": {
                    "elementId": "user_email",
            }

        }, 2 );

        // 4. matching a submit form
        cy.eventsWithProperties( {

            "schema": submitFormSchema,
            "values": {
                "elements": [
                    {
                        "name": "user_email",
                        "value": "fake@email.com",
                    }
                ]
            }

        }, 1 );

        // 5. checking that password field was never tracked
        // 5.1 - for submit_form
        cy.eventsWithProperties( {

            "schema": submitFormSchema,
            "values": {
                "elements": [
                    {
                        "name": "user_password",
                    }
                ]
            }

        }, 0 );

        // 5.2 - for change_form and focus_form
        cy.eventsWithProperties( {

            "values": {
                "name": "user_password",
            }

        }, 0 );

    });


    // assertion with context
    it( 'asserts webpage context in all events', () => {

        const webPageContextSchema = "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0";

        cy.eventsWithContexts( [ { "schema": webPageContextSchema } ], 10 );

    });

});
