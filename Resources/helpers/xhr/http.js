/*
 * http.js
 *
 * /helpers/xhr/http.js
 *
 * This module handles xhr/remote requests
 *
 * Author:		kbueschel
 * Date:		2015-01-09
 *
 * Maintenance Log
 *
 * Author:
 * Date:
 * Changes:
 *
 * Copyright (c) 2014 by die.interaktiven GmbH & Co. KG. All Rights Reserved.
 * Proprietary and Confidential - This source code is not for redistribution
 */

var _xhrClients = {};

/**
 * Standard HTTP Request
 *
 * args could be: {
 *
 * 	timeout:				Timeout time, in milliseconds
 *  type:					Type of request, "GET", "POST", etc
 *  format:					Format of return data, one of "JSON", "TEXT", "XML" or "DATA"
 *  url:					The URL source to call
 * 	headers:				Array of request headers to send
 * 	data:					The data to send
 *  passThrough:			Parameters to pass through to the failure or success callbacks
 * 	async:					Should request be async
 * 	shouldAthenicate:		if should authenticate is set to true, "username" and "password" must be provided
 * 	contentType:			content type
 * 	requestName:			Name for the request
 * 	fileHandle:				file handle to save response to
 * 	userAgent:				user agent to sent
 * 	referer:				referer
 * 	promise:				Returns promise if needed
 *
 * 	done:					A function to execute when when successful
 * 	fail:					A function to execute when there is an XHR error
 * 	progress:				A function to execute when the progress of XHR changes
 * 	stateChange:			A function to execute when the XHRready state changes
 * }
 *
 * @public
 * @method request
 * @param {Map/Dictonary} args
 * @return void
 */
exports.request = function(args) {

	// load toolbox
	var Tools = require("/helpers/common/tools");


	// merge args with defaults
	var params = Tools.merge({

		timeout:				10000,
		type:					"GET",
		format:					"DATA",
		async:					true,
		shouldAuthenticate:		false,
		contentType:			"",
		requestName:			(new Date().getTime() + Tools.createRandomNumber(1, 9, 4)),
		fileHandle:				undefined,
		userAgent:				"",
		referer:				"",
		promise:				true,

		done:					function(){},
		fail:					function(){},
		progress:				function(){},
		stateChange:			function(){}

	}, args);


	// DEBUG
Ti.API.info("[http].request():params.url = ", params.url);


	// create promise if required
	if (params.promise) {

		var Q = require('/helpers/xhr/q'),
		    deferred = Q.defer();
	}


	// create XHR client
	var xhr = Ti.Network.createHTTPClient({

		enableKeepAlive: false
	});


	// save xhr reference
	_xhrClients[params.requestName] = xhr;


	// set guid
	xhr.guid = params.requestName;


	// set timeout
	xhr.setTimeout(params.timeout);


	// create result object
	var result = {};


	// state change callback
	xhr.onreadystatechange = function(onReadyStateChangeEvent) {

		// execute callback from params
		params.stateChange(onReadyStateChangeEvent);

		return;

	}; // END onreadystatechange()


	// load callback
	xhr.onload = function(onloadEvent) {

		if (result) {

			// check request status
            result.xhrStatus =		xhr.status;
			result.requestName =	params.requestName;


			// merge event data to result object
			Tools.merge(result, onloadEvent);


            // get data in given format from options
			switch(params.format.toUpperCase()) {

				case "DATA":
				case "XML":

					result.data = this.responseData;
					break;

				case "JSON":

					result.data = JSON.parse(this.responseText);
					break;

				case "TEXT":

					result.data = this.responseText;
					break;
			}


			// for Android file must be self written
            if (Tools.isAndroid && params.fileHandle) {

                result.fileSaved =	params.fileHandle.write(result.data);
            }


            // set file path
            if (params.fileHandle) {

                result.filePath = params.fileHandle.getNativePath();
            }


			// DEBUG INFO
		Ti.API.info('[http].request().onload():url ="', params.url, '"was successfull');


			// remove xhr from reference array
			exports.cancel(params.requestName);


			// execute callback from params
			if  (params.passthrough) {

				params.done(result, params.url, params.passthrough);
			}
			else {

				params.done(result, params.url);
			}


			// execute promise if required
			if (params.promise && deferred) {

				deferred.resolve({

					result:      result,
					url:         params.url,
					passthrough: params.passthrough
				});
			}
		}
		// execute promise if required
		else if (params.promise && deferred) {

			deferred.reject(new Error('Server has not returned result'));
		}

		return;

	}; // END onload()


	// progress callback
    xhr.ondatastream = function(dataStreamEvent) {

        // execute callback from params
		params.progress(dataStreamEvent);

		// execute promise if required
		if (params.promise && deferred) {

			deferred.notify(dataStreamEvent.progress);
		}

		return;

    }; // END ondatastream()


	// error callback
	xhr.onerror = function(onerrorEvent) {

		// check request status
		result.data = xhr.responseText;
		result.xhrStatus = xhr.status;
		result.requestName = params.requestName;


		// merge event data to result object
		Tools.merge(result, onerrorEvent);


        if (params.fileHandle) {
            result.filePath = params.fileHandle.getNativePath();
        }


        // DEBUG ERROR
		Ti.API.error('[http].request().onerror():url ="', params.url, '"has failed!', onerrorEvent);


		// remove xhr from reference array
		exports.cancel(params.requestName);


        // execute callback from params
		if (params.passthrough) {

			params.fail(result, params.url, params.passthrough);
		}
		else {
			params.fail(result, params.url);
		}


		// execute promise if required
		if (params.promise && deferred) {

			deferred.reject({

				result:      result,
				url:         params.url,
				passthrough: params.passthrough
			});
		}

		return;

	}; // END onerror()


	// open request
	xhr.open(params.type, params.url, params.async);


	// setup content type
    if (params.contentType.length > 0) {
        xhr.setRequestHeader('Content-Type', params.contentType);
    }


	// set referer
    if (params.referer.length > 0) {
        xhr.setRequestHeader('Referer', params.referer);
    }


	// set request headers
	if (params.headers && params.headers.length) {

		params.headers.forEach(function(header, index) {

			xhr.setRequestHeader(header.name, header.value);

		}, this);
	}


	// overcomes the 'unsupported browser' error sometimes received
	xhr.setRequestHeader("User-Agent", "Appcelerator Titanium/" + Tools.tiVersion + " (" + Tools.osname + "/" + Tools.osVersion+ "; " + Tools.platformName + "; " + Ti.Locale.currentLocale + ";)");


	// setup user agent
    if (params.userAgent.length > 0) {
        xhr.setRequestHeader('User-Agent', params.userAgent);
    }


    // for iOS set filehandle property for XHR
    if (Tools.isIOS && params.fileHandle) {
        xhr.file = params.fileHandle;
    }


    // if authentication must be provided
    if (params.shouldAuthenticate) {
        xhr.setRequestHeader('Authorization', ('Basic ' + Ti.Utils.base64encode(params.username + ':' + params.password)));
    }


	// if data given send with data
	if (params.data) {

		if (params.format.toLocaleLowerCase() === 'JSON') {

			xhr.send(JSON.stringify(params.data));
		}
		else {

			xhr.send(params.data);
		}
	}
	// else send request w/o data
	else {

		xhr.send();
	}


	// return request object or promise if required
	if (params.promise && deferred) {

		return deferred.promise;
	}

	return xhr;

}; // END request()


/**
 * Process multiple get requests
 *
 * @public
 * @method requestMultiple
 * @param {Object} args
 * @param {Boolean} promise
 * @return void
 */
exports.requestMultiple = function(args, promise) {

	args = args = {};

	if (promise === true) {

 		return _requestMultiplePromise(args);
	}

	return 	_requestMultipleAsync(args.items, args.concurrency, args.attempts, args.drainCallback, args.saturatedCallback, args.emptyCallback);

}; // END requestMultiple()


/**
 * Process multiple get requests with async library
 *
 * Example item: {
 * 	url:	required e.g.:   'http://www.example.com'
 * 	done:	Function - optional
 * 	fail: 	Function - optional
 * 	args:	MapDictonary see exports.request() -> args - optional
 * }
 *
 * @private
 * @method _requestMultipleAsync
 * @param {Array} items - required: Array with items (objects) that should be downloaded
 * @param {Number} concurrency - optional: An integer for determining how many worker functions should be run in parallel.
 * @param {Number} attempts - optional: Reattempts for each item if it fails (CURRENTLY NOT IMPLEMENTED)
 * @param {Function} drainCallback - optional: a callback that is called when the last item from the queue has returned from the worker
 * @param {Function} saturatedCallback - optional: a callback that is called when the queue length hits the concurrency and further tasks will be queued
 * @param {Function} emptyCallback - optional: a callback that is called when the last item from the queue is given to a worker
 * @return void
 */
function _requestMultipleAsync(items, concurrency, attempts, drainCallback, saturatedCallback, emptyCallback) {

    // load toolbox
    var Tools = require('/helpers/common/tools');

    if (Tools.type(items) === 'array' && items.length) {

        // define default options
        concurrency =   ((Tools.type(concurrency) === 'number' && concurrency) ? concurrency : 1),
        attempts =      ((Tools.type(attempts) === 'number' && attempts) ? attempts : 0);


        // protect "this"
        var that = this;


        // define process function for each item in queue
        function process (item, processCallback) {

            // include requirements
            var Tools = require('/helpers/common/tools');


            // download item
            that.get(

            	// get source
                item.url,

                // success callback
                function(resultData) {

                    if (item.done) {
                    	item.done(resultData);
                    }

                    if (item.doneEvent) {

	                    require('/helpers/app/EventDispatcher').trigger(item.doneEvent, resultData);
                    }

                    processCallback(null);
                },

                // error callback
                function(resultData) {

                    if (item.fail) {

	                    item.fail(resultData);
                    }

                    if (item.failEvent) {

	                    require('/helpers/app/EventDispatcher').trigger(item.failEvent, resultData);
                    }

                    processCallback(resultData.event);
                },

                // extra params
                (Tools.type(item.extraParams) === 'object' ? item.extraParams : {})
            );

        }; // END process()


        // load Async module
        var Async = require('/helpers/xhr/async');


        // create download queue
        var downloadQueue = Async.queue(process, concurrency);


        // assign drainCallback if given
        if (Tools.type(drainCallback) === 'function') {
            downloadQueue.drain = drainCallback;
        }


        // assign saturatedCallback if given
        if (Tools.type(saturatedCallback) === 'function') {
            downloadQueue.saturated = saturatedCallback;
        }


        // assign emptyCallback if given
        if (Tools.type(emptyCallback) === 'function') {
            downloadQueue.empty = emptyCallback;
        }


        // push items to queue, this will start the download process
        downloadQueue.push(items, function(error) {});
    }
    else if (Tools.type(drainCallback) === 'function') {

    	drainCallback();
    }

    return;

} // END _requestMultipleAsync()


/**
 * Process multiple get requests and return a promise
 *
 * @private
 * @method _requestMultiplePromise
 * @param {Array} items - required: Array with items (objects) -> see exports.request():args that should be downloaded
 * @return void
 */
function _requestMultiplePromise(items) {

    // load toolbox
    var Tools =	require('/helpers/common/tools'),
    	Q =		require('/helpers/xhr/q');

    if (Tools.type(items) === 'array' && items.length) {

        return Q.all(items.map(function(item, index) {

        	item.promise = true;

        	return Q(exports.request(item));
        }));
	}

    return Q.all([]);

} // END _requestMultiplePromise()


/**
 * Cancels a single or multiple request
 *
 * @public
 * @method cancel
 * @param {String/String[]} args
 * @return void
 */
exports.cancel = function(args) {

	var Tools = require('/helpers/common/tools'),
	    requestNames = [];


	// DEBUG
Ti.API.debug('[http].cancel():', 'args?', JSON.stringify(args), 'open xhr count?', Object.keys(_xhrClients).length);


	if (args) {

		if (Tools.type(args) === 'array') {

			requestNames = args;
		}
		else if (Tools.type(args) === 'string') {

			requestNames.push(args);
		}


		// DEBUG
	Ti.API.debug('[http].cancel():', 'requestNames', requestNames);


		requestNames.forEach(function(requestName) {

			var xhr = _xhrClients[requestName];

			if (xhr) {

				try {

					// DEBUG
				Ti.API.debug('[http].cancel():Aborting xhr for request "', requestName, '"');


					xhr.abort();
				}
				catch(abortException) {

					// DEBUG ERROR
					Ti.API.error('[http].cancel():Error on aborting xhr for request "', requestName, '"! Exception: ', abortException);
				}
				finally {

					// GC
					xhr = null;
					_xhrClients[requestName] = null;

					delete _xhrClients[requestName];
				}
			}

			return;
		});
	}


	// DEBUG
Ti.API.debug('[http].cancel():END', 'open xhr count?', Object.keys(_xhrClients).length);


	return;

}; // END cancel()


/**
 * Cancel all pending requests
 *
 * @public
 * @method cancelAll
 * @return void
 */
exports.cancelAll = function() {

	require('/helpers/common/tools').each(_xhrClients, function(xhr) {

		// cancel request
		xhr.abort();


		// GC
		xhr = null;


		return;
	});


	// GC
	_xhrClients.length = 0;


	return;

}; // END cancelAll()
