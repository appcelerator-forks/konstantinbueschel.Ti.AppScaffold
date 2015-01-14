/*
 * installrUpdater.js
 *
 * /Resources/helpers/app/installrUpdater.js
 *
 * This module show installr updates right in the app
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

// private statefull module variables
// CONSTANTS
var URL_ENDPOINT =  "https://www.installrapp.com/apps/status/",
    DIST =          "adhoc";

// Last time we prompted them
var lastCheck = 0;


/**
 * Default installr request callback, checks if there is a new
 * build/version the app and shows up a dialog to update app or not
 *
 * @private
 * @method _defaultHanlder
 * @param {Object} response
 * @return void
 */
function _defaultHandler(response) {

	var now = new Date(),
	    secondsSinceLastCheck = Math.floor((now - lastCheck) / 1000);

	if (secondsSinceLastCheck < (60 * 10)) {

		// Don't prompt the user more than once every ten minutes
	Ti.API.info('[installrUpdater]:It has only been', secondsSinceLastCheck, 'seconds since we last prompted the user, skipping this time');

		return;
	}

	// Get the current version number
	var currentVersion = Ti.App.version,
	    currentVersionParts = currentVersion.split('.'),
	    installrVersionParts = response.versionNumber.split('.'),
	    isSame = true;


	for (var i = 0; i < currentVersionParts.length; i++) {

		var currentStep = currentVersionParts[i],
		    installrStep = "0";

		if (installrVersionParts[i]) {
			installrStep = installrVersionParts[i];
		}


		if (currentStep != installrStep && Number(currentStep) < Number(installrStep)) {
			isSame = false;
		}
	}


	// DEBUG
Ti.API.debug('[installrUpdate]._defaultHandler(): local', currentVersion, 'installr', response.versionNumber, response.buildNumber, 'isSame =', isSame);


	if (!isSame) {

		var dialog = Ti.UI.createAlertDialog({
			cancel:      1,
			buttonNames: [L('installrUpdaterButtonTitleOk', 'Yes'), L('installrUpdaterButtonTitleNo', 'No')],
			message:     String.format(L('installrUpdaterMessage', 'A new version of the %s app (v%s) is available. Would you like to download the new version now?'), response.title, response.buildNumber),
			title:       L('installrUpdaterTitle', 'Upgrade Available'),
			persistent:  true
		});

		dialog.addEventListener('click', function (e) {
			if (e.index === e.source.cancel) {
				return;
			}
			else {
				Ti.Platform.openURL(response.installUrl);
			}
		});

		dialog.show();
		lastCheck = new Date();

	}
	else {

	Ti.API.info("[installrUpdater]:Version on installr is the same or older as local version:", currentVersion, "(local) =", response.versionNumber, "Build", response.buildNumber, "(installr)");
	}

	return;

} // END _defaultHandler()


/**
 * Starts installr request to gather last app build
 * information from installr
 *
 * @private
 * @method _checkForNewerVersion
 * @param {String} appId
 * @param {Function} _success
 * @return void
 */
function _checkForNewerVersion(appId, dist, _success) {

	if ((dist || DIST) !== 'adhoc' && Ti.App.deployType == 'production') {

	Ti.API.info("[installrUpdater]:Will not check for updates in production deployType");
		return;
	}

	if (appId == "") {

		Ti.API.error("[installrUpdater]:appId required");
		return;
	}

	if (!Ti.Network.online) {

	Ti.API.info("[installrUpdater]:App is not online, not checking for new version");
		return;
	}

	// hit API on installr to see the data
	var http = Ti.Network.createHTTPClient();

	http.open("GET", (URL_ENDPOINT + appId + ".json"));

	http.onload = function () {

		var responseJSON = JSON.parse(http.responseText);

		if (responseJSON.result == "success") {


			// DEBUG
		Ti.API.debug('[installrUpdater].http.onload():responseJSON.appData =', responseJSON.appData);


			if (_success) {

				_success(responseJSON.appData);

			}
			else {

				_defaultHandler(responseJSON.appData);
			}

		}
		else {

			Ti.API.error(responseJSON.message);
		}
	};

	http.onerror = function () {
		Ti.API.error(http.statusText);
	};

	http.send();

	return;

} // END _checkForNewerVersion()


/**
 * Sets event listener for autochecking for new installr version
 *
 * @private
 * @method _autocheck
 * @param {String} theAppId
 * @param {String} dist
 * @return void
 */
function _autocheck(theAppId, dist) {

	// run this on resume and network back online
	Ti.App.addEventListener('resume', function () {
		_checkForNewerVersion(theAppId, dist);
	});

	Ti.Network.addEventListener('change', function (e) {
		if (e.online) {
			_checkForNewerVersion(theAppId, dist);
		}
	});

	_checkForNewerVersion(theAppId, undefined, dist);

	return;

} // END _autocheck()


// provide public access to methods
exports.autocheck = _autocheck;
exports.checkForNewerVersion = _checkForNewerVersion;
