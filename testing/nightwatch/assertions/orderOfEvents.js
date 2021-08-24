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


/*
    jshint -W069
*/

/**
 * Check that events are sent to micro in the correct order
 *
 * ...
 *    this.demoTest = function (order) {
 *      browser.assert.orderOfEvents(events_list);
 *    };
 *
 * @method orderOfEvents
 * @param {Array} [events]  Events in the order we expect to see on micro
 * @param {string} [message] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */


var eventMatcher = require('../../jsm/helpers.js');


function OrderOfEvents(givenEvents, msg) {
    let DEFAULT_MSG = 'Testing that events arrive to micro in the correct order';

    this.message = msg || DEFAULT_MSG;

    this.expected = () => {
        return true;
    };

    this.pass = (flagOrder) => {
        return flagOrder === this.expected();
    };

    this.value = (goodEvents) => {
        return eventMatcher.inOrder(goodEvents, givenEvents);
    };

    this.command = (callback) => {
        const request = require('request');

        request({
            url: 'http://localhost:9090/micro/good',
            json: true
        }, (err, res, body) => {
            if (err) {
                console.warn(err);
                return false;
            }
            callback(body);
        });
    };

}

module.exports.assertion = OrderOfEvents;
