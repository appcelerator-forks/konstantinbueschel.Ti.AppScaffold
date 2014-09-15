/*
 * Hessentag 2014
 * 
 * GeolocationProvider.js
 * 
 * /Resources/helpers/geolocation/GeolocationProvider.js
 * 
 * This module provides methods and function to fetch current position,
 * place, reverse and forward location lookups etc.
 * 
 * Author:		kbueschel
 * Date:		2014-05-27
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

/**
 * GeolocationProvider class
 * 
 * @constructor
 * @method GeolocationProvider
 * @param {Object} options
 * @return {GeolocationProvider} this
 */
function GeolocationProvider(options) {
	
	// include requirements
	var Tools = require('/helpers/common/tools');
	
	
	// merge options
	this.options = Tools.merge({
		
		purpose:							L('gelocationPurposeTextDefault'),
    	accuracy:							Ti.Geolocation.ACCURACY_NEAREST_TEN_METERS,
    	activityType:						Ti.Geolocation.ACTIVITYTYPE_OTHER,
    	distanceFilter:						10,
		pauseLocationUpdateAutomatically:	false,
		trackSignificantLocationChange:		false
		
	}, options);
	
	
	// variable declaration
	this.isFetchingLocation = false;
	this.locationUpdateCallback;
	
	
	// setup geolocation
	Ti.Geolocation.purpose =							this.options.purpose;
	Ti.Geolocation.accuracy =							this.options.accuracy;
	Ti.Geolocation.activityType =						this.options.activityType;
	Ti.Geolocation.distanceFilter =						this.options.distanceFilter;
	Ti.Geolocation.pauseLocationUpdateAutomatically =	this.options.pauseLocationUpdateAutomatically;
	Ti.Geolocation.trackSignificantLocationChange =		this.options.trackSignificantLocationChange;
	
	
	return this;
	
}; // END GeolocationProvider()


/**
 * Retrieves current coordinates from the device
 * 
 * @public
 * @method getCurrentPosition
 * @param {Function} positionRetrievedCallback
 * @return
 */
GeolocationProvider.prototype.getCurrentPosition = function(positionRetrievedCallback) {
	
	var Tools = require('/helpers/common/tools');
	
	
	if (Tools.type(positionRetrievedCallback) === 'function') {
		
		Ti.Geolocation.getCurrentPosition(positionRetrievedCallback);		
	}
	
}; // END getCurrentPosition()


/**
 * Creates class/object with all of the availability information
 * like is location service enbaled, reverse geocoding is available etc.
 * 
 * @public
 * @method getAvailability
 * @return {Object}
 */
GeolocationProvider.prototype.getAvailability = function() {
	
	return require('bencoding.basicgeo').createAvailability();
	
}; // END getAvailability()


/**
 * JSON representation of the last geolocation received.
 * 
 * LastEvent is the JSON version of the last geolocation sent by the OS. 
 * This does not trigger a geolocation attempt, nor wait for such. If no 
 * geolocation has happened, this value may be null or undefined.
 * 
 * @public
 * @method getLastGeolocation
 * @return {Mixed} Object/undefined
 */
GeolocationProvider.prototype.getLastGeolocation = function() {
	
	var lastGeolocationJSON = 	Ti.Geolocation.getLastGeolocation(),
		lastGeolocationObject =	undefined;
	
	if (lastGeolocationJSON && lastGeolocationJSON.length) {
		
		var Tools = require('/helpers/common/tools');
		
		try {
			
			lastGeolocationObject = Tools.parseJSON(lastGeolocationJSON);
		}
		catch (parseException) {
			
			// DEBUG ERROR			
			Tools.error('GeolocationProvider -> getLastGeolocation()');
			Tools.error('JSON parse error of last geolocation is failed! Exception: ' + parseException);
			
			
			lastGeolocationObject = undefined;
		}
	}
	
	return lastGeolocationObject;
	
}; // END getLastGeolocation()


/**
 * Return geo helper module
 * 
 * @public
 * @method getHelper
 * @return {bencoding.basicgeo Helpers}
 */
GeolocationProvider.prototype.getHelper = function() {
	
	return require('bencoding.basicgeo').createHelpers();
	
}; // END getHelper()


/**
 * Description
 * 
 * @public
 * @method startMonitoring
 * @param {Function} locationUpdateCallback
 * @param {Object} locationCallbackThis
 * @return void
 */
GeolocationProvider.prototype.startMonitoring = function(locationUpdateCallback, locationCallbackThis) {
	
	if (!this.isFetchingLocation && locationUpdateCallback) {
		
		// define callback
		this.locationUpdateCallback = function(locationUpdateEvent) {
			
			locationUpdateCallback.call((locationCallbackThis || this), locationUpdateEvent);
		};
		
		
		// start monitoring
		Ti.Geolocation.addEventListener('location', this.locationUpdateCallback);
		
		
		// set fetching state
		this.isFetchingLocation = true;
	}
	
	
	return;
	
}; // END startMonitoring()


/**
 * Description
 * 
 * @public
 * @method stopMonitoring
 * @return void
 */
GeolocationProvider.prototype.stopMonitoring = function() {
	
	if (this.isFetchingLocation && this.locationUpdateCallback) {
		
		Ti.Geolocation.removeEventListener('location', this.locationUpdateCallback);
		
		this.isFetchingLocation =		false;
		this.locationUpdateCallback =	undefined;
	}

	
	return;
	
}; // END stopMonitoring()


// provide public access to module
module.exports = GeolocationProvider;
