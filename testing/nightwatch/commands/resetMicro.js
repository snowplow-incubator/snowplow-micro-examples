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


/**
Clears Snowplow Micro's cache - to be used before each test
**/
const EventEmitter = require('events');

class ResetMicro extends EventEmitter {
    command() {

        const request = require('request');

        request('http://localhost:9090/micro/reset', {}, (err, res, body) => {
            if (err) {
                console.log(err);
                throw "Unable to reset micro";
            }
        });
        this.emit('complete');
        return this;

    }
}

module.exports = ResetMicro;
