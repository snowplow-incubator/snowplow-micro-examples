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
 * @param {number} [expected_event] Number of good events expected to be sent to micro
 * @param {string} [message] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */

SameEvent = function (expected_event, noOfEvents=1, msg) {
    this.message = msg || 'Testing micro received the expected'+ noOfEvents +'events of type' + expected_event;

    this.expected = () => {
      return noOfEvents;
    }

    this.pass = (value) => {
      return value === this.expected();
    };

    this.value = (eventsOnMicro) => {
    // matching the expected event with events on micro
    // increasing counter and returning the value of the counter
      var matchedEventsMicro_cnt = 0;

             for(var eventM in eventsOnMicro){
                 // match the context of each event M with our expected event context
                 matched = true
                if(eventM["event"]["parameters"].hasOwnProperty("co") && eventM["event"]["parameters"]["co"].hasOwnProperty("data") &&
                     expected_event.hasOwnProperty("contexts")){
                 matched &=matchEventContext(expected_event["contexts"], eventM["event"]["parameters"]["co"])["data"]
                 }

                 if (matched && matchEventsBySchema(expected_event,eventM)
                                              && matchEventsByParams(expected_event, eventM)){
                    matchedEventsMicro_cnt++;
                 }

             }


      return matchedEventsMicro_cnt;
    };


    function sortContextBySchema(a,b){
        if (a["schema"] < b["schema"])
          return -1;
        if ( a["schema"] > b["schema"])
          return 1;
        return 0;
    }

    function equalEventContext(eventContexts, microContexts){
        // context is a list of contexts
        if (eventContexts.length != microContexts.length){
            return false;
        }
        eventContexts.sort(sortContextBySchema);
        microContexts.sort(sortContextBySchema);
        matched = false;
        for(var i=0; i < eventContexts.length; i++){
           matched = JSON.stringify(eventContext) === JSON.stringify(microContext);
           if(matched){
                 break;
           }
        }

        return matched;

    }

    function equalEventsBySchema(event, microEvent){
        if (!(event["eventType"] == "ue" & microEvent["eventType"] == "ue")){
            return false
        }

        return event["schema"] === microEvent["event"]["parameters"]["ue_pr"]["data"]["schema"];

    }

    function equalEventsByParams(event, microEvent){
        return JSON.stringify(event['parameters']) === JSON.stringify(microEvent['event']['parameters']);

    }


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

  module.exports.assertion = SameEvent;