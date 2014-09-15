/*
 * tools.js
 * 
 * /Resources/helpers/common/tools.js
 * 
 * This module gives handy functions and device platform 
 * lookups as a set of tools.
 * 
 * Author:		kbueschel
 * Date:		2014-09-08
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

// osname
exports.osname = Ti.Platform.osname;

// manufacturer
exports.manufacturer = Ti.Platform.manufacturer;

// model
exports.deviceModel = Ti.Platform.model;

// platform name
exports.platformName = Ti.Platform.name;
    

// runs on android os 
exports.isAndroid = (exports.osname === 'android');

// runs on iOS os
exports.isIOS = (exports.osname.search(/iphone/i) !== -1 || exports.osname.search(/ipad/i) !== -1);

// runs on tablet
exports.isTablet = (exports.osname === 'ipad' || (exports.osname === 'android' && (Math.min(exports.deviceHeight, exports.deviceWidth) > 700)));


// DPI
exports.deviceDPI = Ti.Platform.displayCaps.dpi;
exports.deviceXDPI = Ti.Platform.displayCaps.xdpi;
exports.deviceYDPI = Ti.Platform.displayCaps.ydpi;

// density
exports.densityLevel = Ti.Platform.displayCaps.density;

// logical density factor
exports.densityFactor = Ti.Platform.displayCaps.logicalDensityFactor;


/**
 * Converts Pixel to device specific DP
 * 
 * @public
 * @method pixelToDPUnit
 * @param {Number} pixel
 * @return {Number} dp 
 */
exports.pixelToDPUnit = function(pixel) {
    
	if (exports.deviceDPI > 160) {
		
		return (pixel / (exports.deviceDPI / 160));
	}
		
	return pixel;
	
}; // END pixelToDPUnit()
 
 
/**
 * Converts device specific DP to pixel
 * 
 * @public
 * @method dpUnitToPixel
 * @param {Number} dpUnit
 * @return {Number} pixel
 */
exports.dpUnitToPixel = function(dpUnit) {
    
	if (exports.deviceDPI > 160) {
		return (dpUnit * (exports.deviceDPI / 160));
	}
	
	return dpUnit;
	
}; // dpUnitToPixel()


// default system layout unit
exports.defaultUnit = Ti.App.Properties.getString('ti.ui.defaultunit', 'system');


// device width
exports.deviceWidth = (function() {
	
	if (exports.isAndroid && (exports.defaultUnit === 'dp' || exports.defaultUnit === 'dip')) {
		
		return exports.pixelToDPUnit(Ti.Platform.displayCaps.platformWidth);
	}
	
	return Ti.Platform.displayCaps.platformWidth;
	
})();


// device height
exports.deviceHeight = (function() {
	
	if (exports.isAndroid && (exports.defaultUnit === 'dp' || exports.defaultUnit === 'dip')) {
		
		return exports.pixelToDPUnit(Ti.Platform.displayCaps.platformHeight);
	}
	
	return Ti.Platform.displayCaps.platformHeight;
	
})();


// root page for (Google) Analytics tracking
exports.analyticsBasePage = (exports.isAndroid ? (exports.isTablet ? 'AndroidTablet' : 'AndroidPhone') : exports.deviceModel);

// TiSDK version
exports.tiVersion = Ti.version;

// app version
exports.appVersion = Ti.App.version;

// app name
exports.appName = Ti.App.name;

// os version
exports.osVersion = Ti.Platform.getVersion();

// runs on retina device
exports.isRetina = (exports.deviceDPI === 320 && exports.densityLevel === 'high' && exports.platformName.search(/[iPod]/ig) === -1);

// runs on simulator
exports.isSimulator = (exports.deviceModel.toUpperCase() === 'GOOGLE_SDK' || exports.deviceModel.toUpperCase() === 'SIMULATOR' || exports.deviceModel.toUpperCase() === 'X86_64');

// returns app installation ID previous UDID 
exports.installationID = Ti.Platform.id;

// deploy type
exports.deployType = Ti.App.getDeployType();

// has device a camera
exports.isCameraSupported = Ti.Media.isCameraSupported;


// returns Android API Version Codes
exports.androidVersionCodes = (function() {
	
	if (exports.isAndroid) {
		
		return {
			
			L:						20,
			"4.4W": 				20,
            LMP:                    20,
			KITKAT:					19,
			
			JELLY_BEAN_MR2:			18,
			JELLY_BEAN_MR1:			17,
			JELLY_BEAN:				16,
			
			ICE_CREAM_SANDWICH_MR1:	15,
			ICE_CREAM_SANDWICH:		14,
			
			HONEYCOMB_MR2:			13,
			HONEYCOMB_MR1:			12,
			HONEYCOMB:				11,
			GINGERBREAD_MR1:		10
		};
	}
	
	return undefined;
	
})();


// return Android API Level
exports.apiLevel = (function() {
	
	if (exports.isAndroid) {
		
		return Ti.Platform.Android.API_LEVEL;
	}
	
	return undefined;
	
})();


// supports background service
exports.supportsBackgroundTasks = (function() {
    
    if (exports.osname === 'android') {
        return true;
    }
    
    if (exports.osname === 'iphone') {
        
        var osVersion = exports.osVersion.split('.');
        
        // if not iOS 4, then false
        if (parseInt(osVersion[0], 10) < 4) {
            return false;
        }
        
        // is greater than iPhone 3GS
        // this confirms hardware supports background processing
        var model =         exports.deviceModel.toLowerCase().replace('iphone', '').trim(),
            phoneVersion =  exports.osVersion.split('.');
            
        if (parseInt(phoneVersion[0], 10) < 3) {
            return false;
        }
    }
    
    // assume modern device return true
    return true;
    
})(); // END supportsBackgroundTasks()


// runs on 4-inch device
exports.is4InchIPhone = (function() {
    
    if (exports.osname !== 'iphone') {
        return false;
    }
    
    return (Math.max(exports.deviceHeight, exports.deviceWidth) > 480);
    
})(); // END is4InchIphone()


// runs with at least with iOS7
exports.isIOS7Plus = (function() {
    
    if (exports.isAndroid) {
        return false;
    }
    
    var version = exports.osVersion.split('.');
    
    return (parseInt(version[0], 10) >= 7);
    
})(); // END isIOS7Plus()


// returns app info GET query string
exports.appInfoQueryString = ('aos=' + exports.osname + '&av=' + exports.appVersion);


// return statusbar height
exports.statusBarHeight = (function() {
	
    var statusbarHeight = 0;
    
    if (exports.isAndroid) {

    	switch (exports.deviceDPI) {
	        
	        case 160:
	            statusbarHeight = 25;
	            break;
	        
	        case 120:
	            statusbarHeight = 19;
	            break;
	        
	        case 240:
	            statusbarHeight = 38;
	            break;
	        
	        case 320:
	            statusbarHeight = 50;
	            break;
	            
	        default:
	            statusbarHeight = 25;
	            break;
	    }
    }
    else if (exports.isIOS) {
    	
    	statusbarHeight = (exports.isRetina ? 40 : 20);
    }
    
    return statusbarHeight;
    
})(); // END statusBarHeight


// return navigationbar height
exports.navigationBarHeight = (function() {
	
	var navigationBarHeight = 0;
	
	if (exports.isIOS) {
		
		navigationBarHeight = 44;
	}
	else if (exports.isAndroid) {
		
		navigationBarHeight = (exports.isTablet ? 56 : 48);
	}
	
	return navigationBarHeight;
	
})(); // END navigationBarHeight


// is device online
exports.hasNetworkConnectivity = function() {
    
    return Ti.Network.online;
    
}; // END hasNetworkConnectivity()


// wich network type is currently connected
exports.getNetworkType = function() {
    
    return Ti.Network.networkType;
    
}; // END getNetworkType()


/**
 *
 * Merge the contents of two objects together into the first object and return it.
 * 
 * .merge( target [, object1] )
 * 
 * @method merge
 * @param {Object} destination An object that will receive the new properties if additional objects are passed in
 * @param {Object} source An object containing additional properties to merge in.
 * @return {Object} destination An object containing properties from both parameter objects
 */
exports.merge = function(destination, source) {
    
    var property;
    
    for (property in source) {
        
        if (source[property] && source[property].constructor && source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            arguments.callee(destination[property], source[property]);
        }
        else {
            destination[property] = source[property];
        }
    }
    
    return destination;
    
}; // END merge


/**
 * Like merge it merge the contents of n-objects together, 
 * but not into first object, rather into a new empty one.
 * 
 * @public
 * @method combine
 * @return {Object} combinedObject
 */
exports.combine = function() {
	 
	// variable initialization
	var combinedObject =	{},
		source = 			{},
		
		objectsCount =		arguments.length,
		i =					0;


	// combine one object by one
	for (i; i < objectsCount; i++) {
		
		source = arguments[i];
		
		if (source && source.constructor && source.constructor === Object) {
			
			combinedObject = exports.merge(combinedObject, source);
		}
	}


	//return the newly combined object
	return combinedObject; 
	
}; // END combine()


/**
 * Invokes the method named by methodName on each element 
 * in the collection returning an array of the results of 
 * each invoked method. Additional arguments will be provided 
 * to each invoked method. If methodName is a function it will 
 * be invoked for, and this bound to, each element in the collection.
 * 
 * @public
 * @method invoke
 * @param {Array/Object/String} collection to iterate over
 * @param {Function/String} name of the method to invoke or the function invoked per iteration
 * @param {...*} Arguments to invoke the method with
 * @return {Array} A new array of the results of each invoked method
 */
exports.invoke = function() {
	
	return require('/helpers/common/lodash').invoke.apply(this, arguments);
	
}; // END invoke()


/**
 * Returns the OS specific property from given map
 * 
 * e.g.: getOSProperty({
 *  android:    100,
 *  iphone:     200,
 *  ipad:       300 
 * });
 * 
 * @method getOSProperty
 * @param {Object} map
 * @return {Property}
 */
exports.getOSProperty = function(/*Object*/map) {
    
    // default function or value
    var def =       (map.def || null),
        osname =    exports.osname;
    
    
    if (map[osname]) {
        if (type(map[osname]) === 'function') { 
            return map[osname](); 
        }
        else { 
            return map[osname]; 
        }
    }
    else {
        if (exports.type(def) === 'function') { 
            return def(); 
        }
        else { 
            return def; 
        }
    }
    
}; // END getOSProperty()


/**
 * Returns the specific deploy property from given map 
 * 
 * e.g.: getDeployProperty({
 *  test:    100,
 *  development:     200,
 *  production:       300 
 * });
 * 
 * @method getDeployProperty
 * @param {Object} map
 * @return {Property}
 */
exports.getDeployProperty = function(/*Object*/map) {
    
    //default function or value
    var def =           (map.def || null),
        deployType =    exports.deployType;
    
    if (map[deployType]) {
        if (typeof map[deployType] === 'function') { 
            return map[deployType](); 
        }
        else { 
            return map[deployType]; 
        }
    }
    else {
        if (exports.type(def) === 'function') { 
            return def(); 
        }
        else { 
            return def; 
        }
    }
    
}; // END getDeployProperty()


var class2type = {};

/**
 * Determine the internal JavaScript [[Class]] of an object.
 * 
 * @method type
 * @param {Object} obj
 * @return {String}
 */
exports.type = function(obj) {
    
    var toString =     Object.prototype.toString,
        types =        'Boolean Number String Function Array Date RegExp Object';
    
    if (exports.isEmptyObject(class2type)) {
        
        var splittedTypes = types.split(' ');
        
        if (splittedTypes && splittedTypes.length) {
            
            splittedTypes.forEach(function(type) {
                class2type['[object ' + type + ']'] = type.toLowerCase();            
            });    
        }
    }
    
    return (obj === null ? String(obj) : class2type[toString.call(obj)] || 'object');
        
}; // END type()


/**
 * Checks if a given value is present in a collection using strict 
 * equality for comparisons, i.e. ===. If fromIndex is negative, it 
 * is used as the offset from the end of the collection.
 * 
 * @method contains
 * @param {Array/Object/String} collection
 * @param {*} target
 * @param {Number} fromIndex=0 - optional
 * @return {Boolean}
 */
// exports.contains = function(collection, target, fromIndex) {
exports.contains = function() {
	
	return require('/helpers/common/lodash').contains.apply(null, arguments);
	
}; // END contains()


/**
 * Converts number of bytes to human readable format
 *
 * @method bytesToHumanReadableFormat
 * 
 * @param {Integer} bytes Number of bytes to convert
 * @param {Integer} precision Number of digits after the decimal separator
 * @param {Boolean} appendUnit Boolean append Unit?
 * 
 * @return {String}
 */
exports.bytesToHumanReadableFormat = function(bytes, precision, appendUnit) {
    
    var sizes =         ['Bytes', 'KB', 'MB', 'GB', 'TB'],
        posttxt =       0,
        appendUnit =    ((appendUnit === true || appendUnit === false) ? appendUnit : true);
    
    if (bytes == 0) {
        return 'n/a';  
    } 
    
    if (bytes < 1024) {
        if (appendUnit === true) {
            
            return (Number(bytes) + ' ' + sizes[posttxt]);    
        }
        else {
            return Number(bytes);
        }
        
    }
    
    while ( bytes >= 1024 ) {
        posttxt++;
        bytes = (bytes / 1024);
    }
    
    if (appendUnit === true) {
        
        return (Number(bytes).toFixed(precision) + ' ' + sizes[posttxt]);    
    }
    else {
        
        return Number(bytes).toFixed(precision);
    }
    
}; // END bytesToSize()


/**
 * Returns whether given object is "empty" or not
 * 
 * @method isEmptyObject
 * @param {Object} obj
 * @return {Mixed}
 */
exports.isEmptyObject = function(obj) {
    
    if (obj && typeof obj === 'object') {
        
        var keys = [],
            k;
                            
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        
        return (keys.length === 0);                            
    }
    
    return undefined;
        
}; // END isEmptyObject()


/**
 * Chunks given array
 * 
 * @method chunkArray
 * 
 * @param {Array} ary
 * @param {Integer} chunkLength
 * 
 * @return {Array} chunks
 */
exports.chunkArray = function(ary, chunkLength) {

    var chunks =    [],
        i =         0,
        n =         ary.length;

    while (i < n) {
        chunks.push(ary.slice(i, (i += chunkLength)));
    }

    return chunks;
    
}; // END chunkArray


/**
 * Returns current unix timestamp
 * 
 * @method getNow
 * @return {Number}
 */
exports.getNow = function() {
	
    return require('/helpers/common/lodash').now();
    
}; // END getNow()


/**
 * Returns random number from interval [minNumber;maxNumber]
 * 
 * @method createRandomNumber
 * 
 * @param {Number/Integer} minNumber
 * @param {Number/Integer} maxNumber
 * @param {Number/Integer} digitCount
 * 
 * @return {Number/Integer}
 */
exports.createRandomNumber = function(minNumber, maxNumber, digitCount) {
    
    var _ = require('/helpers/common/lodash');
    
    if (digitCount && digitCount > 1) {
        
        var randomNumber = '',
            i;
        
        for (i = digitCount; i > 0; i--) {
            randomNumber += _.random(minNumber, maxNumber); 
        }
        
        return Number(randomNumber);
    }
    
    return _.random(minNumber, maxNumber);
        
}; // END createRandomNumber()


/**
 * Adding leading zeros to number until digits
 * length is reached 
 * 
 * @method padDigits
 * @param {Number} num
 * @param {Number} digits
 * @return {String} 
 */
exports.padDigits = function(num, digits) {
    
    var numberString = '';
    
    if (exports.type(num) === 'number') {
        
        var numberString =  String(num),
            maxLength =     (numberString.length > digits ? numberString.length : digits);
    
        while (numberString.length < maxLength) {
            numberString = ('0' + numberString);
        }        
    }
    
    return numberString;
    
}; // END padDigits()


/**
 * Determines if given string is url 
 * 
 * @public
 * @method isURL
 * @param {String} str
 * @return {Boolean} isURL
 */	
exports.isURL = function(str) {
	
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	
	return regexp.test(str);

}; // END isURL()


/**
 * Saves data persistent
 * 
 * @public 
 * @method saveDataPersistent
 * @param {Object} options
 * @return void 
 */
exports.saveDataPersistent = function(options) {
	
	Ti.App.Properties['set' + (options.type || 'String')](options.property, options.data);
	
	return;
	
}; // END saveDataPersistent()


/**
 * Retrieves persistent saved data
 * 
 * @public 
 * @method getPersistentData
 * @param {Object} options
 * @return {Mixed} data
 */
exports.getPersistentData = function(options) {
	
	return Ti.App.Properties['get' + (options.type || 'String')](options.property, options.defaultData);
	
}; // END getPersistentData()


/**
 * Navigates app to given window etc. from options
 * 
 * @public
 * @method navigateApp
 * @param {Object} options
 * @return void
 */
exports.navigateApp = function(options) {
	
	Ti.App.fireEvent('app:navigate', options);
	
	return;
	
}; // END navigateApp()


/**
 * Convertes query string into object
 * 
 * @public
 * @method queryStringToObject
 * @param {String} queryString
 * @return {Object}
 */
exports.queryStringToObject = function(queryString) {            
    
    var pairs =		queryString.split('&'),
    	result =	{};
    
    
    pairs.forEach(function(pair) {
        
        pair = pair.split('=');
        
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });


    return JSON.parse(JSON.stringify(result));
    
}; // END queryStringToObject()


/**
 * Turns a JSON like object argument to param query string 
 * 
 * Note: If the value is null, key and value is skipped in http_build_query of PHP. But, phpjs is not.
 * depends on: urlencode
 * 
 *     example 1: http_build_query({foo: 'bar', php: 'hypertext processor', baz: 'boom', cow: 'milk'}, '', '&amp;');
 *     return 1: 'foo=bar&amp;php=hypertext+processor&amp;baz=boom&amp;cow=milk'
 * 
 *     example 2: http_build_query({'php': 'hypertext processor', 0: 'foo', 1: 'bar', 2: 'baz', 3: 'boom', 'cow': 'milk'}, 'myvar_');
 *     return 2: 'php=hypertext+processor&myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&cow=milk'
 * 
 * 
 * @public
 * @method paramsToQueryString
 * @param {Object} formData
 * @param {String} numericPrefix
 * @param {String} argSeparator
 * @return {String} queryString
 */
exports.paramsToQueryString = function(formData, numericPrefix, argSeparator) {
    
    var value, key, tmp = [],
        that = this;

	/**
	 * Query build helper
	 * 
	 * @private
	 * @method _http_build_query_helper
	 * @param {Object} key
	 * @param {Object} val
	 * @param {Object} argSeparator
	 * @return {String}
	 */
    var _http_build_query_helper = function (key, val, argSeparator) {
        
        var k, tmp = [];
        
        if (val === true) {
            val = '1';
            
        } else if (val === false) {
            
            val = '0';
        }
        
        if (val != null) {
            
            if (typeof(val) === 'object') {
                
                for (k in val) {
                    
                    if (val[k] != null) {
                        tmp.push(_http_build_query_helper(key + '[' + k + ']', val[k], argSeparator));
                    }
                }
                
                return tmp.join(_argSeparator);
                
            }
            else if (typeof(val) !== 'function') {
                
                return Ti.Network.encodeURIComponent(key) + '=' + Ti.Network.encodeURIComponent(val);
                
            }
            else {
                
                throw new Error('There was an error processing for http_build_query().');
            }
        } 
        else {
        	
            return '';
        }
        
    }; // END _http_build_query_helper()
    

    if (!argSeparator) {
        argSeparator = '&';
    }
    
    
    for (key in formData) {
        
        value = formData[key];
        
        if (numericPrefix && !isNaN(key)) {
            
            key = (String(numericPrefix) + key);
        }
        
        var query = _http_build_query_helper(key, value, argSeparator);
        
        if (query != '') {
            
            tmp.push(query);
        }
    }

    return tmp.join(argSeparator);
    
}; // END paramsToQueryString()


/**
 * Returns a momentjs object for date manipulation
 * 
 * @public
 * @method getMoment
 * @return {Moment}
 */
exports.getMoment = function() {
	
	var Moment = require('/helpers/date/moment');
	
	Moment.locale(Ti.Locale.getCurrentLocale());
	
	return Moment.apply(null, arguments);
	
}; // END 
