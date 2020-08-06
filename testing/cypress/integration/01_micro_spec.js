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


context('testing events from 01_app_spec.js', () => {

    // noBadEvents
    it('asserts no bad events', () => {

        cy.noBadEvents();

    });


    // matching by eventType
    it('asserts number of events by eventType', () => {

        cy.eventsWithEventType("ue", 7);
        cy.eventsWithEventType("pv", 3);

    });


    // checking form events
    it('assertions on form events', () => {


        const focusFormSchema = "iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0";
        const changeFormSchema = "iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0";
        const submitFormSchema = "iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0";


        // different ways to assert similar things

        // 1. just with schema
        cy.eventsWithSchema(submitFormSchema, 1);

        // 2. with schema and values
        cy.eventsWithProperties({

            "schema": changeFormSchema,
            "values": {
                "type": "email",
                "value": "fake@email.com"
            }

        }, 1);

        // 3. also without the schema key in event_options
        // NOTE: we are expecting this to match only with focus_form and change_form events
        //       and not with the submit_form one.
        //       The reason is that the submit_form schema,
        //       wraps the inputs' values in an array ("elements"). See below.
        cy.eventsWithProperties({

            "values": {
                "elementId": "user_email"
            }

        }, 2);

        // 4. matching a submit form
        cy.eventsWithProperties({

            "schema": submitFormSchema,
            "values": {
                "elements": [{
                    "name": "user_email",
                    "value": "fake@email.com"
                }]
            }

        }, 1);

        // 5. checking that password field was never tracked
        // 5.1 - for submit_form
        cy.eventsWithProperties({

            "schema": submitFormSchema,
            "values": {
                "elements": [{
                    "name": "user_password"
                }]
            }

        }, 0);

        // 5.2 - for change_form and focus_form
        cy.eventsWithProperties({

            "values": {
                "name": "user_password"
            }

        }, 0);

    });


    // assertion with context
    it('asserts webpage context in all events', () => {

        const webPageContextSchema = "iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0";

        cy.eventsWithContexts([{
            "schema": webPageContextSchema
        }], 10);

    });


    // asserts order of events
    it('compares timestamps to assert events happened in the order specified', () => {

        const focusFormSchema = "iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0";
        const changeFormSchema = "iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0";
        const submitFormSchema = "iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0";

        // with 2 events
        cy.eventsWithOrder([{
                "schema": focusFormSchema,
                "values": {
                    "elementId": "user_email"
                }
            },
            {
                "schema": submitFormSchema
            }
        ]);

        // with 3 events
        cy.eventsWithOrder([{
                "schema": focusFormSchema,
                "values": {
                    "elementId": "user_email"
                }
            },
            {
                "schema": changeFormSchema,
                "values": {
                    "elementId": "user_email"
                }
            },
            {
                "schema": submitFormSchema
            }
        ]);

    });

});
