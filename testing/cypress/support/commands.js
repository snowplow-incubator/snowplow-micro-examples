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


/*
    jshint -W069
*/

import * as Micro from '../../jsm/helpers.js';

const ALL = Cypress.env('SNOWPLOW_MICRO_URI') + Cypress.env('MICRO_ALL');
const GOOD = Cypress.env('SNOWPLOW_MICRO_URI') + Cypress.env('MICRO_GOOD');
const BAD = Cypress.env('SNOWPLOW_MICRO_URI') + Cypress.env('MICRO_BAD');
const RESET = Cypress.env('SNOWPLOW_MICRO_URI') + Cypress.env('MICRO_RESET');

/**
 * A Context object.
 * @typedef Context
 * @type {Object}
 * @property {string} schema - The schema of the context.
 * @property {Object} data - The data of the context.
 */


/**
 * A Properties object.
 * @typedef Properties
 * @type {Object}
 * @property {string} [schema] The event's schema (for unstructured events)
 * @property {Object} [values] The event's data values (for unstructured events)
 * @property {Array.<Context>} [contexts] The event's attached contexts
 * @property {Object} [parameters] The event's parameters
 */

/**
 * Returns the response of cy.request() having parsed the response body as JSON
 *
 * ```
 * cy.requestJson('http://localhost:9090/micro/all');
 * ```
 *
 * @method requestJson
 * @param {string} myUrl The url to make the request to
 */
Cypress.Commands.add('requestJson', (myurl) => {

    cy.request({
        url: myurl,
        json: true
    });

});


/**
 * Resets Snowplow Micro
 *
 * ```
 * cy.resetMicro();
 * ```
 *
 * @method resetMicro
 */
Cypress.Commands.add('resetMicro', () => {

    cy.request(RESET);

});


/**
 * Asserts whether Snowplow Micro received any bad events
 *
 * ```
 * cy.noBadEvents();
 * ```
 *
 * @method noBadEvents
 */
Cypress.Commands.add('noBadEvents', () => {

    cy.requestJson(BAD)

        .then(($res) => {

            expect($res.body.length).to.eq(0);
        });

});


/**
 * Asserts on the number of good events received by Snowplow Micro
 *
 * ```
 * cy.numGoodEvents(15);
 * ```
 *
 * @method numGoodEvents
 * @param {number} n The expected number of good events
 */
Cypress.Commands.add('numGoodEvents', (n) => {

    n = parseInt(n);

    cy.requestJson(GOOD)

        .then(($res) => {

            expect($res.body.length).to.eq(n);

        });

});


/**
 * Asserts on the number of events having a given schema
 *
 * ```
 * cy.eventsWithSchema("iglu:com.acme/test_event/jsonschema/1-0-0", 2);
 * ```
 *
 * @method eventsWithSchema
 * @param {string} schema The event's schema to match
 * @param {number} [n=1] The expected number of matching events
 */
Cypress.Commands.add('eventsWithSchema', (schema, n = 1) => {

    n = parseInt(n);

    cy.requestJson(GOOD)

        .its('body')

        .then(($arr) => {

            const res = Micro.matchBySchema($arr, schema);

            expect(res.length).to.eq(n);

        });

});


/**
 * Asserts on the number of events having a given type
 *
 * ```
 * cy.eventsWithEventType("se", 7);
 * ```
 *
 * @method eventsWithEventType
 * @param {string} eventType The event's type to match
 * @param {number} [n=1] The expected number of matching events
 */
Cypress.Commands.add('eventsWithEventType', (eventType, n = 1) => {

    n = parseInt(n);

    cy.requestJson(GOOD)

        .its('body')

        .then(($arr) => {

            const res = Micro.matchByEventType($arr, eventType);

            expect(res.length).to.eq(n);

        });

});


/**
 * Asserts on the number of events having a given set of properties (schema, values, contexts, parameters)
 *
 * ```
 * cy.eventsWithProperties({
 *     "schema": "iglu:com.acme/test_event/jsonschema/1-0-0",
 *     "values": {
 *         "testProperty": true
 *     },
 *     "contexts": [{
 *         "schema": "iglu:com.acme/test_context/jsonschema/1-0-0",
 *         "data": {
 *             "testCoProp": 0,
 *         }
 *     }],
 *     "parameters": {
 *         "uid": "tester",
 *         "tna": "myTrackerName"
 *     }
 * }, 3);
 * ```
 *
 * @method eventsWithProperties
 * @param {Properties} eventOptions The options to match against
 * @param {number} [n=1] The expected number of matching events
 */
Cypress.Commands.add('eventsWithProperties', (eventOptions, n = 1) => {

    n = parseInt(n);

    cy.requestJson(GOOD)

        .its('body')

        .then(($arr) => {

            const res = Micro.matchEvents($arr, eventOptions);

            expect(res.length).to.eq(n);

        });

});


/**
 * Asserts on the number of events having given parameters
 *
 * ```
 * cy.eventsWithParams({
 *     "e": "se",
 *     "se_ca": "Mixes",
 *     "se_ac": "Play"
 * }, 3);
 * ```
 *
 * @method eventsWithParams
 * @param {Object} params The event's parameters to match against
 * @param {number} [n=1] The expected number of matching events
 */
Cypress.Commands.add('eventsWithParams', (params, n = 1) => {

    n = parseInt(n);

    cy.requestJson(GOOD)

        .its('body')

        .then(($arr) => {

            const res = Micro.matchByParams($arr, params);

            expect(res.length).to.eq(n);

        });

});


/**
 * Asserts on the number of events with given contexts attached
 *
 * ```
 * cy.eventsWithContexts([
 *     {
 *         "schema": "iglu:com.acme/a_test_context/jsonschema/1-0-0",
 *         "data": {"testProp": true}
 *     },{
 *         "schema": "iglu:com.acme/b_test_context/jsonschema/1-0-0"
 *     }], 2);
 * ```
 *
 * @method eventsWithContexts
 * @param {Array.<Context>} contextsArray The event's contexts to match against
 * @param {number} [n=1] The expected number of matching events
 */
Cypress.Commands.add('eventsWithContexts', (contextsArray, n = 1) => {

    n = parseInt(n);

    cy.requestJson(GOOD)

        .its('body')

        .then(($arr) => {

            const res = Micro.matchByContexts($arr, contextsArray);

            expect(res.length).to.eq(n);
        });
});


/**
 * Asserts events fire in order (ascending), given their properties
 *
 * ```
 * cy.eventsWithOrder([
 *     {
 *         "schema": "iglu:com.acme/a_test_context/jsonschema/1-0-0",
 *         "values": {"testProp": true}
 *     },{
 *         "schema": "iglu:com.acme/b_test_context/jsonschema/1-0-0"
 *     }]);
 * ```
 *
 * @method eventsWithOrder
 * @param {Array.<Properties>} eventsSpecs An array of event properties that uniquely specify events
 */
Cypress.Commands.add('eventsWithOrder', (eventsSpecs) => {

    cy.requestJson(GOOD)

        .its('body')

        .then(($arr) => {

            const flag = Micro.inOrder($arr, eventsSpecs);

            expect(flag).to.eq(true);

        });
});
