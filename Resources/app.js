/*
 * app.js
 *
 * /Resources/app.js
 *
 * Application bootstrap file
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

// add printf prototype to String object for better string formatting
String.prototype.printf = function (obj) {

	var useArguments = false,
	    _arguments = arguments,
	    i = -1;

	if (typeof _arguments[0] == 'string') {
		useArguments = true;
	}

	if (obj instanceof Array || useArguments) {

		return this.replace(/\%s/g, function (a, b) {

			i++;

			if (useArguments) {

				if (typeof _arguments[i] == 'string') {
					return _arguments[i];
				}
				else {
					throw new Error('Arguments element is an invalid type');
				}
			}

			return obj[i];
		});
	}
	else {

		return this.replace(/{([^{}]*)}/g, function (a, b) {

			var r = obj[b];

			return (typeof r === 'string' || typeof r === 'number' ? r : a);
		});
	}
};


// require application controller
var appController = require('/control/ApplicationController');

appController.launch(require('/helpers/common/tools').isAndroid ? Ti.Android.currentActivity.intent.getData() : null);
