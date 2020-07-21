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

NoBadEvents = function(msg) {
    this.message = msg || 'Testing no bad events have been sent';

    this.expected = () => {
        return 0;
    }

    this.pass = (value) => {
        return value === this.expected();
    };

    this.value = (json) => {
        return parseInt(json['bad']);
    };

    this.command = (callback) => {
        const request = require('request');

        request({
            url: 'http://localhost:9090/micro/all',
            json: true
        }, (err, res, body) => {
            if (err) {
                console.warn(error);
                return false;
            }
            callback(body);
        });
    };

};

module.exports.assertion = NoBadEvents;