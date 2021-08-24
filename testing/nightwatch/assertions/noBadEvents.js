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
 * Checks there are no bad events
 *
 * ```
 *    this.demoTest = function (client) {
 *      browser.assert.noBadEvents();
 *    };
 * ```
 *
 * @method noBadEvents
 * @param {string} [message] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */

function NoBadEvents(msg) {
    this.message = msg || 'Testing no bad events have been sent';

    this.expected = () => {
        return 0;
    };

    this.pass = (value) => {
        return value === this.expected();
    };

    this.value = (json) => {
        return parseInt(json["bad"]);
    };

    this.command = (callback) => {
        const request = require('request');

        request({
            url: 'http://localhost:9090/micro/all',
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

module.exports.assertion = NoBadEvents;
