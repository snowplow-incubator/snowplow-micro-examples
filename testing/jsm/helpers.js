// helper functions for testing with Snowplow Micro

/*
    jshint -W069
*/

/**
 * A Snowplow event object.
 * @typedef {Object} Event
 */


/**
 * A Context object.
 * @typedef Context
 * @type {Object}
 * @property {string} schema - The schema of the context.
 * @property {Object} data - The data of the context.
 */


/**
 * A Properties object.
 * @typedef Properties
 * @type {Object}
 * @property {string} [schema] The event's schema (for unstructured events)
 * @property {Object} [values] The event's data values (for unstructured events)
 * @property {Array.<Context>} [contexts] The event's attached contexts
 * @property {Object} [parameters] The event's parameters
 */


/**
 * The event parameters whose values are JSON strings
 * @constant
 * @type {Array}
 * @default
 */
const needParse = ['ue_pr', 'co'];


/**
 * The event parameters whose values may be base64-encoded if the encodeBase64 tracker initialization parameter is set to true
 * @constant
 * @type {Array}
 * @default
 */
const needDecode = ['ue_px', 'cx'];


/**
 * Filters an array of Snowplow events based on eventType
 * ```
 * matchByEventType(goodEventsArray, "pv");
 * ```
 * @param {Array.<Event>} eventsArray An array of Snowplow events
 * @param {string} eventType The eventType to match
 * @returns {Array.<Event>} An array with the matching events
 */
function matchByEventType(eventsArray, eventType) {

    return eventsArray.filter(hasEventType(eventType));

}


/**
 * Filters an array of Snowplow events based on schema
 *
 * ```
 * matchBySchema(goodEventsArray, "iglu:com.acme/test_event/jsonschema/1-0-0");
 * ```
 *
 * @param {Array.<Event>} eventsArray An array of Snowplow events
 * @param {string} schema The schema to match
 * @returns {Array.<Event>} An array with the matching events
 */
function matchBySchema(eventsArray, schema) {

    return eventsArray.filter(hasSchema(schema));

}


/**
 * Filters an array of unstructured Snowplow events based on data values
 *
 * ```
 * matchByVals(goodEventsArray, {"targetUrl": "https://docs.snowplowanalytics.com/"});
 * ```
 *
 * @param {Array.<Event>} eventsArray An array of unstructured Snowplow events
 * @param {Object} valsObj The object having as keys the data values to match
 * @returns {Array.<Event>} An array with the matching events
 */
function matchByVals(eventsArray, valsObj) {

    return eventsArray.filter(hasValues(valsObj));

}


/**
 * Filters an array of Snowplow events based on parameter values
 *
 * ```
 * matchByParams(goodEventsArray,
 *               {
 *                   "e": "se",
 *                   "se_ca": "Mixes",
 *                   "se_ac": "Play",
 *               });
 * ```
 *
 * @param {Array.<Event>} eventsArray An array of Snowplow events
 * @param {Object} paramsObj An object having as keys the parameters to match
 * @returns {Array.<Event>} An array with the matching events
 */
function matchByParams(eventsArray, paramsObj) {

    return eventsArray.filter(hasParams(paramsObj));

}


/**
 * Filters an array of Snowplow events based on an array of attached contexts
 *
 * ```
 * matchByContexts(goodEventsArray,
 *                 [{
 *                     "schema": "iglu:com.acme/a_test_context/jsonschema/1-0-0",
 *                     "data": {"testprop": 0}
 *                 },{
 *                     "schema": "iglu:com.acme/b_test_context/jsonschema/1-0-0"
 *                 }]);
 * ```
 *
 * @param {Array.<Event>} eventsArray An array of Snowplow events
 * @param {Array.<Context>} expectedContextsArray An array of contexts
 * @returns {Array.<Event>} An array with the matching events
 */
function matchByContexts(eventsArray, expectedContextsArray) {

    return eventsArray.filter(hasContexts(expectedContextsArray));

}


/**
 * Filters an array of Snowplow events based on event's Properties
 *
 * ```
 * matchEvents(goodEventsArray,
 *             {
 *                 "schema": "iglu:com.acme/test_event/jsonschema/1-0-0",
 *                 "values": {
 *                     "testProperty": true
 *                 },
 *                 "contexts": [{
 *                     "schema": "iglu:com.acme/test_context/jsonschema/1-0-0",
 *                     "data": {
 *                         "testCoProp": 0,
 *                     }
 *                 }],
 *                 "parameters": {
 *                     "uid": "tester",
 *                     "tna": "myTrackerName"
 *                 }
 *             });
 * ```
 *
 * @param {Array.<Event>} microEvents An array of Snowplow events
 * @param {Properties} eventProps The event properties to match against
 * @returns {Array.<Event>} An array with the matching events
 */
function matchEvents(microEvents, eventProps) {

    if (Object.prototype.toString.call(microEvents) !== "[object Array]") {

        microEvents = [microEvents];

    }

    let res = microEvents;

    if (eventProps["schema"]) {

        res = matchBySchema(res, eventProps["schema"]);

    }

    if (eventProps["values"]) {

        res = matchByVals(res, eventProps["values"]);

    }

    if (eventProps["contexts"]) {

        res = matchByContexts(res, eventProps["contexts"]);

    }

    if (eventProps["parameters"]) {

        res = matchByParams(res, eventProps["parameters"]);

    }

    return res;

}


/**
 * Checks whether Snowplow events fired in ascending order
 *
 * ```
 * inOrder([
 *     {
 *         "schema": "iglu:com.acme/a_test_context/jsonschema/1-0-0",
 *         "values": {"testProp": true}
 *     },{
 *         "schema": "iglu:com.acme/b_test_context/jsonschema/1-0-0"
 *     }]);
 * ```
 *
 * @param {Array.<Event>} eventsArray An array of Snowplow events
 * @param {Array.<Properties>} eventsSpecs An array of event properties that uniquely specify events
 * @returns {Boolean}
 */
function inOrder(eventsArray, eventsSpecs) {

    if (eventsSpecs.length < 2) {
        return false;
    }

    const matchedEvents = eventsSpecs.map((evSpec) => matchEvents(eventsArray, evSpec));

    if (matchedEvents.some((elt) => elt.length !== 1)) {
        return false;
    }

    const ordered = matchedEvents
        .map((elt) => getDtm(elt[0]))
        .reduce(function(acc, curr) {

            return acc !== false && acc < curr && curr;

        });

    return Boolean(ordered);

}


// ------


function getDtm(event) {

    return event["event"]["parameters"]["dtm"];

}


function hasEventType(evType) {

    return function(ev) {

        return ev["eventType"] === evType;

    };

}


function hasSchema(schema) {

    return function(ev) {

        if (ev["eventType"] === "ue") {

            let ue_pr;
            if (ev["event"]["parameters"].hasOwnProperty("ue_pr")) {

                ue_pr = JSON.parse(ev["event"]["parameters"]["ue_pr"]);

            } else { // must then have ue_px

                let decod_ue_px = base64decode(ev["event"]["parameters"]["ue_px"]);

                ue_pr = JSON.parse(decod_ue_px);

            }

            return ue_pr["data"]["schema"] === schema;

        } else {

            return false;

        }

    };

}


function hasValues(values) {

    return function(ev) {

        if (ev["eventType"] === "ue") {

            let ue_pr;

            if (ev["event"]["parameters"].hasOwnProperty("ue_pr")) {

                ue_pr = JSON.parse(ev["event"]["parameters"]["ue_pr"]);

            } else { // must then have ue_px

                let decod_ue_px = base64decode(ev["event"]["parameters"]["ue_px"]);

                ue_pr = JSON.parse(decod_ue_px);

            }

            let data = ue_pr["data"]["data"];

            return Object.keys(values).every(keyIncludedIn(data)) &&
                Object.keys(values).every(comparesIn(values, data));

        } else {

            return false;

        }

    };

}


function hasParams(expectParams) {

    return function(ev) {

        let actualParams = ev["event"]["parameters"];

        let isActualEncoded = needDecode.some(keyIncludedIn(actualParams));
        let isExpectedEncoded = needDecode.some(keyIncludedIn(expectParams));

        if (isActualEncoded && !isExpectedEncoded) {

            actualParams["ue_pr"] = base64decode(actualParams["ue_px"]);
            actualParams["co"] = base64decode(actualParams["cx"]);

        }

        if (!isActualEncoded && isExpectedEncoded) { // that should be rare case

            expectParams["ue_pr"] = base64decode(expectParams["ue_px"]);
            expectParams["co"] = base64decode(expectParams["cx"]);

            // for .every to pass
            delete expectParams["ue_px"];
            delete expectParams["cx"];

        }

        return Object.keys(expectParams).every(keyIncludedIn(actualParams)) &&
            Object.keys(expectParams).every(comparesIn(expectParams, actualParams));

    };

}


function hasContexts(expCoArr) {

    return function(ev) {

        let p = ev["event"]["parameters"];

        if (p.hasOwnProperty("co")) {

            let actCoArr = JSON.parse(p["co"])["data"];

            return compare(expCoArr, actCoArr);

        } else if (p.hasOwnProperty("cx")) {

            let co = base64decode(p["cx"]);
            let actCoArr = JSON.parse(co)["data"];

            return compare(expCoArr, actCoArr);

        } else {

            return false;

        }

    };

}


function keyIncludedIn(obj) {

    return function(key) {

        return Object.keys(obj).includes(key);

    };

}


function comparesIn(expected, actual) {

    return function(key) {

        let expValue, actValue;

        if (needParse.includes(key)) {

            expValue = JSON.parse(expected[key]);
            actValue = JSON.parse(actual[key]);

        } else {

            expValue = expected[key];
            actValue = actual[key];

        }

        return compare(expValue, actValue);

    };

}


/**
 * A function to deep compare (equality for primitive data types and containership for Objects and Arrays)
 *
 * ```
 * compare(1, 1);  // true
 * compare(1, "1");  // false
 * compare([1, 2], [3, 1, 2]);  // true
 * compare({"a":1, "b":2}, {"b":2, "c":3, "a":1});  // true
 * compare([1, [2]], [[3, 2], 1, 4]);  // true
 * compare({"a": [1, 2], "b": {"c":3}}, {"b": {"d":4, "c":3}, "a":[3, 2, 1]});  // true
 * ```
 *
 * @param {*} expVal The expected value
 * @param {*} actVal The actual value
 * @returns {Boolean} Whether the expVal is equal to or deeply contained in actVal
 */
function compare(expVal, actVal) {

    let expType = Object.prototype.toString.call(expVal);
    let actType = Object.prototype.toString.call(actVal);

    if (expVal === null) {

        return actVal === null;

    } else if (expType !== actType) {

        return false;

    } else if (expType === "[object Array]") {

        return expVal.every(function(e) {

            return actVal.some(function(a) {

                return compare(e, a);

            });

        });

    } else if (expType === "[object Object]") {

        return Object.keys(expVal).every(function(k) {

            return Object.keys(actVal).includes(k) &&
                compare(expVal[k], actVal[k]);

        });

    } else {

        return expVal === actVal;

    }

}


/**
 * Decode a base64-encoded string
 * @param {string} encodedData The base64-encoded string
 * @returns {string} The decoded string
 */
function base64decode(encodedData) {
    //  discuss at: http://locutus.io/php/base64_decode/
    // original by: Tyler Akins (http://rumkin.com)
    // improved by: Thunder.m
    // improved by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Kevin van Zonneveld (http://kvz.io)
    //    input by: Aman Gupta
    //    input by: Brett Zamir (http://brett-zamir.me)
    // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
    // bugfixed by: Pellentesque Malesuada
    // bugfixed by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Indigo744
    //   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==')
    //   returns 1: 'Kevin van Zonneveld'
    //   example 2: base64_decode('YQ==')
    //   returns 2: 'a'
    //   example 3: base64_decode('4pyTIMOgIGxhIG1vZGU=')
    //   returns 3: '✓ à la mode'

    // decodeUTF8string()
    // Internal function to decode properly UTF8 string
    // Adapted from Solution #1 at https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding

    var decodeUTF8string = function(str) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(str.split('').map(function(c) {

            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);

        }).join(''));
    };

    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        dec = '',
        tmpArr = [];

    if (!encodedData) {

        return encodedData;

    }

    encodedData += '';

    do {
        // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(encodedData.charAt(i++));
        h2 = b64.indexOf(encodedData.charAt(i++));
        h3 = b64.indexOf(encodedData.charAt(i++));
        h4 = b64.indexOf(encodedData.charAt(i++));

        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;

        if (h3 === 64) {

            tmpArr[ac++] = String.fromCharCode(o1);

        } else if (h4 === 64) {

            tmpArr[ac++] = String.fromCharCode(o1, o2);

        } else {

            tmpArr[ac++] = String.fromCharCode(o1, o2, o3);

        }

    } while (i < encodedData.length);

    dec = tmpArr.join('');

    return decodeUTF8string(dec.replace(/\0+$/, ''));

}


//
// EXPORTS
//


export {
    matchByEventType,
    matchBySchema,
    matchByVals,
    matchByParams,
    matchByContexts,
    matchEvents,
    inOrder,
    compare,
    base64decode
};


exports.matchEvents = matchEvents;
