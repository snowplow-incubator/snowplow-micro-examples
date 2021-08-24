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


var eventMatcher = require('../../jsm/helpers.js');

/**
 * Checks that micro receives the expected event with given parameters
 *
 * ```
 *    this.demoTest = function (client) {
 *       browser.assert.successfulEvent({
                    "eventType": "unstruct",
                    "schema": "iglu:test.example.iglu/cart_action_event/jsonschema/1-0-0",
                    "values": {
                        "type": "add"
                    },
                    "contexts": [{
                        "schema": "iglu:test.example.iglu/product_entity/jsonschema/1-0-0",
                        "data": {
                           "sku": "hh123",
                            "name": "One-size summer hat",
                            "price": 15.5,
                            "quantity": 1
                        }
                       }
                    ]
                });
 *    };
 * ```
 *
 * @method successfulEvent
 * @param {Object} [expected_event] Expected event with given parameters to be sent to micro
 * @param {string} [message] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */
function SuccessfulEvent(expected_event, noOfEvents = 1, msg) {
    this.message = msg || 'Testing micro received the expected ' + noOfEvents + ' events of type' + expected_event;

    this.expected = () => {
        return noOfEvents;
    };

    this.pass = (value) => {
        return value === this.expected();
    };

    this.value = (eventsOnMicro) => {
        let matchingEvs = eventMatcher.matchEvents(eventsOnMicro, expected_event);
        return matchingEvs.length;
    };



    this.command = (callback) => {
        const request = require('request');

        request({
            url: 'http://localhost:9090/micro/good',
            json: true
        }, (err, res, body) => {
            if (err) {
                console.log(err);
                return false;
            }
            callback(body);
        });
    };

}

module.exports.assertion = SuccessfulEvent;
