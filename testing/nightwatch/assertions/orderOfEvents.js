/*
Check that events are sent to micro in the correct order

...
    this.demoTest = function (order) {
        browser.assert.orderOfEvents(events_list);
    };

@method orderOfEvents
 * @param {Array} [events]  Events in the order we expect to see on micro
 * @param {string} [message] Optional log message to display in the output. If missing, one is displayed by default.
*/

var eventMatcher = require('../../jsm/helpers.js');


function OrderOfEvents(events, msg) {
    let DEFAULT_MSG = 'Testing that events arrive to micro in the correct order';

    this.message = msg || DEFAULT_MSG;

    this.expected = () => {
        return events;
    };

    this.pass = (matchedEvents) => {
        // index of test events
        let j = 0;
        for (let i = 0; i < matchedEvents.length & j < events.length; i++) {
            if (eventMatcher.matchEvents(matchedEvents[i], events[events.length - 1])) {
                j++;
            } else if (eventMatcher.matchEvents(matchedEvents[i], events[events.length - 1])) {
                return false;
            }
        }
        // the order is correct only if all of the events are on the micro
        return j == events.length;
    };

    function sortEventsByTimestamp(a, b) {
        if (new Date(a["event"]["context"]["timestamp"]) < new Date(b["event"]["context"]["timestamp"])) {
            return -1;
        }
        if (new Date(a["event"]["context"]["timestamp"]) > new Date(b["event"]["context"]["timestamp"])) {
            return 1;
        }
        return 0;
    };

    this.value = (eventsOnMicro) => {
        // collect matched events
        const matchedEvents = [];
            for (let j = 0; j < events.length; j++) {
                const currMatchedEvents = eventMatcher.matchEvents(eventsOnMicro, events[j]);
                matchedEvents.push.apply(matchedEvents,currMatchedEvents);
            }

        matchedEvents.sort(sortEventsByTimestamp);

        return matchedEvents;
    };

    this.command = (callback) => {
        const request = require('request');

        request({
            url: 'http://localhost:9090/micro/good',
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

module.exports.assertion = OrderOfEvents;
