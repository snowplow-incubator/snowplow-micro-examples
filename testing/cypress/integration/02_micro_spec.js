/*
 * Copyright (c) 2020-2021 Snowplow Analytics Ltd. All rights reserved.
 *
 * This program is licensed to you under the Apache License Version 2.0,
 * and you may not use this file except in compliance with the Apache License Version 2.0.
 * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Apache License Version 2.0 is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
 */


context('testing events from 02_app_spec.js', () => {

    // noBadEvents
    it('asserts no bad events', () => {

        cy.noBadEvents();

    });


    // matching by eventType using eventsWithParams
    it('asserts number of events with a parameter', () => {

        cy.eventsWithParams({
            "event": "unstruct"
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

    it('asserts on order of events', () => {

        const cartActionSchema = "iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0";
        const productEntitySchema = "iglu:test.example.iglu/product_entity/jsonschema/1-0-0";

        // add before remove
        cy.eventsWithOrder([{
                "schema": cartActionSchema,
                "values": {
                    "type": "add"
                },
                "contexts": [{
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "hh123"
                    }
                }]
            },
            {
                "schema": cartActionSchema,
                "values": {
                    "type": "remove"
                },
                "contexts": [{
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "hh123"
                    }
                }]
            }
        ]);

    });

});
