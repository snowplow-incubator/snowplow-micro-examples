/**
 * Checks that micro receives the expected event with given parameters
 *
 * ```
 *    this.demoTest = function (client) {
 *       browser.assert.successfulEvent({
                    "eventType": "ue",
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

var eventMatcher = require('../../jsm/helpers.js');

function SuccessfulEvent(expected_event, noOfEvents = 1, msg) {
    this.message = msg || 'Testing micro received the expected ' + noOfEvents + ' events of type' + expected_event;

    this.expected = () => {
        return noOfEvents;
    };

    this.pass = (value) => {
        return value.length === this.expected();
    };

    this.value = (eventsOnMicro) => {
        return eventMatcher.matchEvents(eventsOnMicro, expected_event);
    };



    this.command = (callback) => {
        const request = require('request');

        request({
            url: 'http://localhost:9090/micro/good',
            json: true
        }, (err, res, body) => {
            if (err) {
                console.log(error);
                return false;
            }
            callback(body);
        });
    };

};

module.exports.assertion = SuccessfulEvent;
