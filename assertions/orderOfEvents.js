/*
Check that events are sent to micro in the correct order

...
    this.demoTest = function (order) {
        browser.assert.orderOfEvents(True);
    };

@method orderOfEvents
@param event1 event2
*/
var eventMatcher = require('./successfulEvent');


OrderOfEvents = function(events, msg){
    let DEFAULT_MSG = 'Testing that events arrive to micro in the correct order';

    this.message = msg || DEFAULT_MSG;

    this.expected = () => {
        return events;
    };

    this.pass = (matchedEvents) => {
        // index of test events
        var j = 0;
        for (i = 0; i < matchedEvents.length & j < events.length; i++){
            if (eventMatcher.matchEvents(events[j], matchedEvents[i])){
               j++;
            }else if (eventMatcher.matchEvents(events[events.length - 1], matchedEvents[i])){
                return false;
            }
        }
        // the order is correct only if all of the events are on the micro
        return j == events.length;
       };

    function sortEventsByTimestamp(a,b){
            if (new Date(a["event"]["context"]["timestamp"]) < new Date(b["event"]["context"]["timestamp"]) ){
              return -1;
            }
            if ( new Date(a["event"]["context"]["timestamp"])> new Date(b["event"]["context"]["timestamp"]) ){
              return 1;
              }
            return 0;
     }


    this.value = (eventsOnMicro) => {
        // collect matched events
        matchedEvents = [];
        for(i = 0; i < eventsOnMicro.length; i++){
                var eventM = eventsOnMicro[i];
                for (j = 0; j < events.length; j++){
                    event = events[j];
                    if (eventMatcher.matchEvents(event, eventM)){
                        matchedEvents.push(eventM);
                        break;
                    }
                }
        }
        matchedEvents.sort(sortEventsByTimestamp);

        return matchedEvents;
    };
 this.command = (callback) => {
    const request = require('request');

    request({url:'http://localhost:9090/micro/good', json:true}, (err, res, body) => {
      if (err) {
        console.log(error);
        return false;
      }
      callback(body);
    });
  };

};

module.exports.assertion = OrderOfEvents;
