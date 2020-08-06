/*
 * Copyright (c) 2018-2020 Snowplow Analytics Ltd. All rights reserved.
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


context('testing events from 03_app_spec.js', () => {

    // noBadEvents
    it('asserts no bad events', () => {

        cy.noBadEvents();

    });


    // assertions with contexts
    it('asserting contexts reflecting quantity changes using eventsWithProperties', () => {

        const cartActionSchema = "iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0";
        const productEntitySchema = "iglu:test.example.iglu/product_entity/jsonschema/1-0-0";
        const webPageContextSchema = "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0";

        // assert contexts using eventsWithProperties
        cy.eventsWithProperties({
            "contexts": [{
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "hh123",
                        "name": "One-size summer hat",
                        "price": 15.5,
                        "quantity": 2
                    }
                },
                {
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "hh456",
                        "price": 24.49,
                        "quantity": 2
                    }
                },
                {
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "bb123",
                        "quantity": 1
                    }
                },
                {
                    "schema": webPageContextSchema
                }
            ]
        }, 1); //only the purchase event

    });


    it('asserting contexts reflecting quantity changes using eventsWithContexts', () => {

        const cartActionSchema = "iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0";
        const productEntitySchema = "iglu:test.example.iglu/product_entity/jsonschema/1-0-0";
        const webPageContextSchema = "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0";

        // - checking quantity
        cy.eventsWithContexts(
            [{
                "schema": productEntitySchema,
                "data": {
                    "sku": "hh123",
                    "name": "One-size summer hat",
                    "price": 15.5,
                    "quantity": 3
                }
            }], 1); // only the cart_event has quantity:3 for this product

        // - checking that event with wrong quantity in one entity does not exist
        cy.eventsWithContexts(
            [{
                    "schema": productEntitySchema,
                    "data": {
                        "name": "One-size summer hat",
                        "quantity": 2 // correct
                    }
                },
                {
                    "schema": productEntitySchema,
                    "data": {
                        "sku": "bb123",
                        "quantity": 2 // correct
                    }
                }
            ], 0);

    });

});
