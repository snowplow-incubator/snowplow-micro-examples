// helper functions for testing with Snowplow Micro


'use strict';


const needParse = [ 'ue_pr', 'co' ];
const needDecode = [ 'ue_px', 'cx' ];


// recurring sanity check
function sane ( n ) {

    if ( n < 0 ) {

        throw( "number of events cannot be negative" );

    }

    return parseInt( n );

}


// Given an array of events and an eventType(string),
// Returns an array of the events having that eventType
function matchByEventType ( eventsArray, eventType ) {

    return eventsArray.filter( hasEventType( eventType ) );

}


// Given an array of events and a schema,
// Returns an array of the events having that schema
function matchBySchema ( eventsArray, schema ) {

    return eventsArray.filter( hasSchema( schema ) );

}


// Given an array of "ue" events and a values object
// Returns an array of the events with matching properties
// [assumes the second argument is an object]
function matchByVals ( eventsArray, valsObj ) {

    return eventsArray.filter( hasValues( valsObj ) );

}


// Given an array of events and a parameters object
// Returns an array of the events with matching parameters
function matchByParams ( eventsArray, paramsObj ) {

    return eventsArray.filter( hasParams( paramsObj ) );

}


// Given an array of events and contexts(array of objects)
// Returns an array of the events with matching contexts
function matchByContexts ( eventsArray, expectedContextsArray ) {

    return eventsArray.filter( hasContexts( expectedContextsArray ) );

}


// ------


function hasEventType ( evType ) {

    return function ( ev ) {

        return ev[ "eventType" ] === evType;

    };

}


function hasSchema ( schema ) {

    return function ( ev ) {

        if ( ev[ "eventType" ] === "ue" ) {

            let ue_pr;

            if ( ev["event"]["parameters"].hasOwnProperty("ue_pr")) {

                ue_pr = JSON.parse( ev[ "event" ][ "parameters" ][ "ue_pr" ] );

            } else {  // must then have ue_px

                let decod_ue_px = base64decode( ev[ "event" ][ "parameters" ][ "ue_px" ] );

                ue_pr = JSON.parse( decod_ue_px );

            }

            return ue_pr[ "data" ][ "schema" ] === schema;

        } else {

            return false;

        }

    };

}


function hasValues ( values ) {

    return function ( ev ) {

        if ( ev[ "eventType" ] === "ue") {

            let ue_pr;

            if ( ev[ "event" ][ "parameters" ].hasOwnProperty( "ue_pr" ) ) {

                ue_pr = JSON.parse( ev[ "event" ][ "parameters" ][ "ue_pr" ] );

            } else {  // must then have ue_px

                let decod_ue_px = base64decode( ev[ "event" ][ "parameters" ][ "ue_px" ] );

                ue_pr = JSON.parse( decod_ue_px );

            }

            let data = ue_pr[ "data" ][ "data" ];

            return Object.keys( values ).every( keyIncludedIn( data ) ) &&
                Object.keys( values ).every( comparesIn( values, data ) );

        } else {

            return false;

        }

    };

}


function hasParams ( expectParams ) {

    return function ( ev ) {

        let actualParams = ev[ "event" ][ "parameters" ];

        let isActualEncoded = needDecode.some( keyIncludedIn( actualParams ) );
        let isExpectedEncoded = needDecode.some( keyIncludedIn( expectParams ) );

        if ( isActualEncoded && !isExpectedEncoded ) {

            actualParams[ "ue_pr" ] = base64decode( actualParams[ "ue_px" ] );
            actualParams[ "co" ] = base64decode( actualParams[ "cx" ] );

        }

        if ( !isActualEncoded && isExpectedEncoded ) {  // that should be rare case

            expectParams[ "ue_pr" ] = base64decode( expectParams[ "ue_px" ] );
            expectParams[ "co" ] = base64decode( expectParams[ "cx" ] );

            // for .every to pass
            delete expectParams[ "ue_px" ];
            delete expectParams[ "cx" ];

        }

        return Object.keys( expectParams ).every( keyIncludedIn( actualParams ) ) &&
            Object.keys( expectParams ).every( comparesIn( expectParams, actualParams ) );

    };

}


function hasContexts ( expCoArr ) {

    return function ( ev ) {

        let p = ev[ "event" ][ "parameters" ];

        if ( p.hasOwnProperty( "co" ) ) {

            let actCoArr = JSON.parse( p[ "co" ] )[ "data" ];

            return compare( expCoArr, actCoArr );

        } else if ( p.hasOwnProperty( "cx" ) ) {

            let co = base64decode( p[ "cx" ] );
            let actCoArr = JSON.parse( co )[ "data" ];

            return compare( expCoArr, actCoArr );

        } else {

            return false;

        }

    };

}


// ------


function keyIncludedIn ( obj ) {

    return function ( key ) {

        return Object.keys( obj ).includes( key );

    };

}


function comparesIn ( expected, actual ) {

    return function ( key ) {

        let expValue, actValue;

        if ( needParse.includes( key ) ) {

            expValue = JSON.parse( expected[ key ] );
            actValue = JSON.parse( actual[ key ] );

        } else {

            expValue = expected[ key ];
            actValue = actual[ key ];

        }

        return compare( expValue, actValue );

    };

}


function compare ( expVal, actVal ) {

    let expType = Object.prototype.toString.call( expVal );
    let actType = Object.prototype.toString.call( actVal );

    if ( expVal === null ) {

        return actVal === null;

    } else if ( expType !== actType ) {

        return false;

    } else if ( expType === "[object Array]" ) {

        return expVal.every( function ( e ) {

            return actVal.some( function ( a ) {

                return compare( e, a );

            });

        });

    } else if ( expType === "[object Object]" ) {

        return Object.keys( expVal ).every( function ( k ) {

            return Object.keys( actVal ).includes( k ) &&
                compare( expVal[ k ], actVal[ k ] );

        });

    } else {

        return expVal === actVal;

    }

}


function base64decode ( encodedData ) {
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

    var decodeUTF8string = function ( str ) {
	// Going backwards: from bytestream, to percent-encoding, to original string.
	return decodeURIComponent( str.split('').map( function (c) {

	    return '%' + ('00' + c.charCodeAt( 0 ).toString( 16 ) ).slice( -2 );

	}).join('') );
    };

    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
	ac = 0,
	dec = '',
	tmpArr = [];

    if ( !encodedData ) {

	return encodedData;

    }

    encodedData += '';

    do {
	// unpack four hexets into three octets using index points in b64
	h1 = b64.indexOf( encodedData.charAt( i++ ) );
	h2 = b64.indexOf( encodedData.charAt( i++ ) );
	h3 = b64.indexOf( encodedData.charAt( i++ ) );
	h4 = b64.indexOf( encodedData.charAt( i++ ) );

	bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

	o1 = bits >> 16 & 0xff;
	o2 = bits >> 8 & 0xff;
	o3 = bits & 0xff;

	if ( h3 === 64 ) {

	    tmpArr[ ac++ ] = String.fromCharCode( o1 );

	} else if ( h4 === 64 ) {

	    tmpArr[ ac++ ] = String.fromCharCode( o1, o2 );

	} else {

	    tmpArr[ ac++ ] = String.fromCharCode( o1, o2, o3 );

	}

    } while ( i < encodedData.length );

    dec = tmpArr.join('');

    return decodeUTF8string( dec.replace(/\0+$/, '') );

}

//
// EXPORTS
//
export {
    sane,
    matchByEventType,
    matchBySchema,
    matchByVals,
    matchByParams,
    matchByContexts,
    compare,
    base64decode
};
