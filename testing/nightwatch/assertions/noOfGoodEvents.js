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
 * Checks that the number of expected good events are sent
 *
 * ```
 *    this.demoTest = function (client) {
 *      browser.assert.noOfGoodEvents(2);
 *    };
 * ```
 *
 * @method NoOfGoodEvents
 * @param {number} [expected_value] Number of good events expected to be sent to micro
 * @param {string} [message] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */

function NoOfGoodEvents(expected_value, msg) {
    this.message = msg || 'Testing number of good events is: ' + expected_value;

    this.expected = () => {
        return expected_value;
    };

    this.pass = (value) => {
        return value === this.expected();
    };

    this.value = (json) => {
        return parseInt(json["good"]);
    };

    this.command = (callback) => {
        const request = require('request');

        request({
            url: 'http://localhost:9090/micro/all',
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

module.exports.assertion = NoOfGoodEvents;
