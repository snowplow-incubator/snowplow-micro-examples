/**
 * Checks that the number of expected total events are correct
 *
 * ```
 *    this.demoTest = function (client) {
 *      browser.assert.noOfTotalEvents(2);
 *    };
 * ```
 *
 * @method NoOfTotalEvents
 * @param {number} [expected_value] Number of total events expected to be sent to micro
 * @param {string} [message] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */

function NoOfTotalEvents(expected_value, msg) {
    this.message = msg || 'Testing that the total number of events is: ' + expected_value;

    this.expected = () => {
        return expected_value;
    }

    this.pass = (value) => {
        return value === this.expected();
    };

    this.value = (json) => {
        return parseInt(json['total']);
    };

    this.command = (callback) => {
        const request = require('request');

        request({
            url: 'http://localhost:9090/micro/all',
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

module.exports.assertion = NoOfTotalEvents;
