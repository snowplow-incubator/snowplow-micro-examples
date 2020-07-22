/**
 * Checks that the tracker is sent to micro as expected
 *
 * ```
 *    this.demoTest = function (client) {
 *      browser.assert.trackerSuccess(["Hover"]);
 *    };
 * ```
 *
 * @method TrackerSuccess
 * @param {number} [event_names_list] List of events expected to be sent to micro
 * @param {string} [message] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */

TrackerSuccess = function(event_names_list, msg) {
    this.message = msg || 'Testing tracker successfully sent following structured events: ' + event_names_list;

    this.expected = () => {
        return event_names_list;
    }

    this.pass = (array1) => {
        //compares that the expected events are equal to the number of good structured events in micro
        return array1.length === this.expected().length && (array1.sort().join(',') === this.expected().sort().join(','));
    };

    this.value = (json) => {
        let struct_events = [];
        for (i = 0; i < json.length; i++) {
            // if the event is a structured event
            if (json[i]["eventType"] === "se") {
                struct_events.push(json[i]["event"]["parameters"]["se_ac"]);
            }
        }

        return struct_events;

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

module.exports.assertion = TrackerSuccess;