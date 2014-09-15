/*
 * globals.js
 * 
 * /Resources/helpers/common/globals.js
 * 
 * This module provides public static vars
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

/**
 * Generates the security token for the
 * ERF Pop App API interface calls
 * 
 * @private
 * @method _getAPIToken
 * @return {String} securityToken
 */
function _getAPIToken() {
	
	return "";
	
} // END _getAPIToken()


var Tools = require('/helpers/common/tools'),

	global = {
    
	    // database
	    databaseName:               'APPNAME_app_db',
	    currentDatabaseVersion:      1,
	    
	    
	    // menu/app navigate actions
	    action: {
	    	
	    	HANDLE_NOTIFICATION:		'HANDLE_NOTIFICATION',
	    	NAVIGATE_BACK:				'BACK',
	    	TOGGLE_MENU:				'TOGGLE_MENU',
			TOGGLE_APP_OVERFLOW_MENU:	'OVERFLOW_MENU',
	    	SET_DRAWER_PROPERTY:		'SET_DRAWER_PROPERTY',
	    	OPEN_DRAWER:				'OPEN_DRAWER',
	    	
	    	HOME_SCREEN:				'HOME',
	    	ON_AIR_SCREEN:				'ONAIR',
	    	DETAIL_SCREEN:				'DETAIL',
	    	MEDIA_LIBRARY_SCREEN:		'MEDIA_LIBRARY',
			SOCIAL_SCREEN:				'SOCIAL',
			SOCIAL_DETAIL_SCREEN:		'SOCIAL_DETAIL',
			PLAYLIST_SCREEN:			'PLAYLIST',
			BACKSTAGE_SCREEN:			'BACKSTAGE',
			SPECIAL_SCREEN:				'SPECIAL',
			DONATE_SCREEN:				'DONATE',
			CONTACT_SCREEN:				'CONTACT',
			WEBSITE_SCREEN:				'WEBSITE',
			ALARM_CLOCK_SCREEN:			'ALARM_CLOCK',
			SETTINGS_SCREEN:			'SETTINGS',
			PRIVACY_POLICY_SCREEN:		'PRIVACY_POLICY',
			IMPRINT_SCREEN:				'IMPRINT',
			
			BROWSER_SCREEN:				'MINI_BROWSER'
	    },
	    
	    detailScreen: {
	    	
	    	MEDIA_LIBRARY:	'MEDIA_LIBRARY_DETAIL',
	    	ALARM_CLOCK:	'ALARM_CLOCK_DETAIL'
	    },
	    
	    // application drawer
	    applicationDrawer: {

	    	iOS: {
				
				OPEN_MODE_NONE:							0,
				OPEN_MODE_PANNING_NAVBAR:				2,
				OPEN_MODE_PANNING_CENTERWINDOW:			4,
				OPEN_MODE_BEZEL_PANNING_CENTERWINDOW:	8,
				OPEN_MODE_ALL:							30,
				
				STATUSBAR_WHITE:						1,
				STATUSBAR_BLACK:						0
	    	},
	    	
	    	android: {
	    		
	    		OPEN_MODE_MARGIN:						0,
	    		OPEN_MODE_ALL:							1,
	    		OPEN_MODE_NONE:							2,
	    		
	    		CLOSE_MODE_NONE:						2,
				CLOSE_MODE_MARGIN:						0,
				CLOSE_MODE_ALL:							1
	    	}
	    },
	    
	    
	    // paths
	    externalPaths: {
	    	
	    	redirect:	'https://api.erf.de/erfpop/redirect/extern?url=%1$s',
	    	program:	'https://api.erf.de/erfpop/redirect/program',
	    	moderators:	'https://api.erf.de/erfpop/redirect/moderators',
	    	team:		'https://api.erf.de/erfpop/redirect/team',
	    	contact:	'https://api.erf.de/erfpop/redirect/kontakt',
	    	donate:		'https://api.erf.de/erfpop/redirect/spenden',
	    	spezial:	'https://api.erf.de/erfpop/redirect/promo'
	    },
	    
	    internalPaths: {
	    	
	    	imprint:		'/assets/html/imprint.html'
	    },
	    
	    
	    // informations for update
	    iTunesQueryID:			'',
	    installrAppToken:		'',
	    
	    
	    // ERF Pop App API interface
	    apiURLPattern: 'https://api.erf.de/erfpop/%1$s?authtoken=%2$s',
		

		// API media library names
	    apiMediaLibraryNames: {
	    	
	    	LATEST:		'aktuell',
	    	BELONGS:	'hingehoert',
	    	JIP:		'jip',
	    	OK:			'onkelkonrad',
	    	SOS:		'sos',
	    	SDT:		'sdt'
	    },
	    

		// API data source URLs
		apiDataEndPoint: {
			
			MEDIA_LIBRARY:	'library.json',
			SOCIAL:			'socialmedia.json',
			PLAYLIST:		'songhistory.json'
		},
		
		
		// default html body
		htmlBody: '<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0" /><meta name="apple-mobile-web-app-capable" content="yes" /><meta name="HandheldFriendly" content="true"/><title></title><link rel="stylesheet" href="assets/html/css/common.css" media="all" /></head><body><section id="content"><div class="wrapper">%1$s</div></section></body></html>'
	    
	}; // END global


// app fixtures
global.FIXTURES = {};


// methods
global.getAPIToken = _getAPIToken;


// provide public access to global variables
exports.global = global;
