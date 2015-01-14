/*
 * globals.js
 *
 * /Resources/helpers/common/globals.js
 *
 * This module provides public static vars
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

// private statefull vars
var Tools = require('/helpers/common/tools');


// database
exports.databaseName = '##APPNAME##_app_db';
exports.currentDatabaseVersion = 1;


// menu/app navigate actions
exports.action = {

	HANDLE_NOTIFICATION:        'HANDLE_NOTIFICATION',
	NAVIGATE_BACK:              'BACK',
	TOGGLE_MENU:                'TOGGLE_MENU',
	CLOSE_MENU:                 'CLOSE_MENU',
	TOGGLE_APP_OVERFLOW_MENU:   'OVERFLOW_MENU',
	SET_DRAWER_PROPERTY:        'SET_DRAWER_PROPERTY',
	OPEN_DRAWER:                'OPEN_DRAWER',
	REMOVE_PREVIOUS_MENU_ITEMS: 'REMOVE_PREVIOUS_MENU_ITEMS',
	CONTEXT_MENU_SELECTION:     'CONTEXT_MENU_SELECTION',

	HOME_SCREEN:           'HOME',
	DETAIL_SCREEN:         'DETAIL',
	CONTACT_SCREEN:        'CONTACT',
	WEBSITE_SCREEN:        'WEBSITE',
	SETTINGS_SCREEN:       'SETTINGS',
	PRIVACY_POLICY_SCREEN: 'PRIVACY_POLICY',
	IMPRINT_SCREEN:        'IMPRINT',

	BROWSER_SCREEN: 'MINI_BROWSER'
};

exports.detailScreen = {

	EXAMPLE: 'EXAMPLE_LIBRARY_DETAIL'
};


// application drawer
exports.applicationDrawer = {

	iOS: {

		OPEN_MODE_NONE:                       0,
		OPEN_MODE_PANNING_NAVBAR:             2,
		OPEN_MODE_PANNING_CENTERWINDOW:       4,
		OPEN_MODE_BEZEL_PANNING_CENTERWINDOW: 8,
		OPEN_MODE_ALL:                        30,

		STATUSBAR_WHITE: 1,
		STATUSBAR_BLACK: 0
	},

	android: {

		OPEN_MODE_MARGIN: 0,
		OPEN_MODE_ALL:    1,
		OPEN_MODE_NONE:   2,

		CLOSE_MODE_NONE:   2,
		CLOSE_MODE_MARGIN: 0,
		CLOSE_MODE_ALL:    1
	}
};


// menu
exports.menu = {

	Android: {

		GROUP_ID_VIEW_MENU:        1,
		GROUP_ID_APP_CONTEXT_MENU: 2,

		ITEM_ID_ALARM_CLOCK:    1,
		ITEM_ID_SETTINGS:       2,
		ITEM_ID_PRIVACY_POLICY: 3,
		ITEM_ID_IMPRINT:        4,

		ITEM_ID_REFRESH: 5,
		ITEM_ID_SHARE:   6,
		ITEM_ID_ADD:     7,
		ITEM_ID_SAVE:    8,

		ITEM_ID_SUPPORT: 9,
		ITEM_ID_DELETE:  10
	}
};


// external n internal paths
exports.paths = {

	external: {

		redirect: 'https://api.die-interaktiven.de/##APPNAME##/redirect/extern?url=%1$s',
		contact:  'https://api.die-interaktiven.de/##APPNAME##/redirect/kontakt'
	},


	internal: {

		imprint:       '/assets/html/imprint.html',
		privacyPolicy: '/assets/html/privacy_policy.html',
		error:         '/assets/html/error.html'
	}
};


// informations for update
exports.iTunesQueryID = '';
exports.installrAppToken = '';
exports.installrAppTokenAndroid = '';


// API interface globals
exports.api = {

	urlPattern: 'https://api.die-interaktiven.de/##APPNAME##/%1$s?authtoken=%2$s',

	dataEndPoint: {

		EXAMPLE: 'example.json'
	}
};


// default html body
exports.htmlBody = '<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0" /><meta name="apple-mobile-web-app-capable" content="yes" /><meta name="HandheldFriendly" content="true"/><title></title><link rel="stylesheet" href="assets/html/css/common.css" media="all" /></head><body><section id="content"><div class="wrapper">%1$s</div></section></body></html>';


// app fixtures
exports.FIXTURES = {

	settings: [

		{
			title:        L('settingsTitleAppVersionSettings'),
			header:       L('settingsHeaderAppVersionSettings'),
			defaultValue: Tools.appVersion,
			property:     'AppVersionSettings',
			editable:     false
		},
		{
			title:        L('settingsTitleSendUsageData'),
			header:       L('settingsHeaderSendUsageData'),
			property:     'SendUsageData',
			defaultValue: true,
			editable:     true
		}
	]
};


// e-mails
exports.emailAdresses = {

	support: 'info@die-interaktiven.de'
};


// App tracking
exports.tracking = {

	id:       'UA-XXXXXXX-XX',
	logLevel: 'trace',
	dryRun:   true // FIXME: "false" for production
};