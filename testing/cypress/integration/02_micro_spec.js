context('testing events from 02_app_spec.js', () => {

    // noBadEvents
    it('asserts no bad events', () => {

        cy.noBadEvents();

    });


    // matching by eventType using eventsWithParams
    it('asserts number of events with a parameter', () => {

        cy.eventsWithParams({
            "e": "ue"
        }, 9);

    });

    // assertions on cart_action events
    it('assertions on cart_action_events', () => {

        const cartActionSchema = "iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0";

        cy.eventsWithSchema(cartActionSchema, 5);

        cy.eventsWithProperties({

            "schema": cartActionSchema,
            "values": {
                "type": "add"
            }

        }, 3);

        cy.eventsWithProperties({

            "schema": cartActionSchema,
            "values": {
                "type": "remove"
            }

        }, 2);

    });

    //
    it('assertions on cart_action_events with contexts', () => {

        const cartActionSchema = "iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0";
        const productEntitySchema = "iglu:test.example.iglu/product_entity/jsonschema/1-0-0";

        cy.eventsWithProperties({

            "schema": cartActionSchema,
            "values": {
                "type": "add"
            },
            "contexts": [{
                "schema": productEntitySchema,
                "data": {
                    "sku": "bb123",
                    "name": "Plain tote bag"

                },
            }]

        }, 1); // that product was added only once...

        // ...and was never removed, so:
        cy.eventsWithProperties({

            "schema": cartActionSchema,
            "values": {
                "type": "remove"
            },
            "contexts": [{
                "schema": productEntitySchema,
                "data": {
                    "sku": "bb123",
                    "name": "Plain tote bag"

                },
            }]

        }, 0);

    });

    it('assertions on contexts', () => {

        const webPageContextSchema = "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0";
        const productEntitySchema = "iglu:test.example.iglu/product_entity/jsonschema/1-0-0";

        // on events that have both schemas
        // for eventsWithContexts the first argument is an array
        cy.eventsWithContexts([{
                    "schema": webPageContextSchema
                },
                {
                    "schema": productEntitySchema
                }
            ],
            6); // cart_actions(5) and purchase(1) events

        // also specifying context data
        cy.eventsWithContexts(
            [{
                    "schema": webPageContextSchema
                },
                {
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "hh456",
                        "name": "One-size bucket hat",
                        "price": 24.49

                    }
                }

            ], 2); // 2 events (adding and removing cart_actions for that product)

    });

});