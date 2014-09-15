/*
 * APPNAME
 * 
 * ApplicationController.js
 * 
 * /Resources/control/ApplicationController.js
 * 
 * This module controls the flow of the app.
 * 
 * Author:		kbueschel
 * Date:		2014-XX-XX
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
 * Private statefull variables 
 */
var _navigationController, _applicationDrawer;
	

/**
 * Handles webview clicks - in most cases opens it with openURL
 * 
 * @private
 * @method _handleWebViewClick
 * @param {Map/Dictonary} args
 * @return void
 */
function _handleWebViewClick(args) {
	
	// include toolbox
	var Tools = require('/helpers/common/tools');
	
	
	// defauls params
	args = Tools.merge({
		
		link:		'',
		linkType:	''
		
	}, args);
	
	
	// DEBUG
	Ti.API.debug('[ApplicationController]._handleWebViewClick():args =', args);
	
	
	if (args.link && args.link.length) {
		
		switch (args.linkType.toUpperCase()) {
			
			// web link handling
			case 'LINK':
				
				Ti.Platform.openURL(args.link);	
				
				break;
			
			
			// telephone number handling	
			case 'TELEPHONENUMBER':
				
				if (Tools.isIOS) {
					
					Ti.Platform.openURL('telprompt:' + args.link);	
				}
				else {
					
					Ti.Platform.openURL('tel:' + args.link);	
				}
			
				break;
			
			
			// email dialog opening	
			case 'EMAIL':
				
				var emailDialog = Ti.UI.createEmailDialog({
					toRecipients:     [args.link],
					
					subject:          '',
					messageBody:      ''
				});	
				
				if (emailDialog.isSupported()) {
					
					emailDialog.open();
				}
				else {
					
					// show notification
					Tools.navigateApp({
						
						action:		require('/helpers/common/globals').global.action.HANDLE_NOTIFICATION,
						
						message:	L('emailDialogNotSupported'),
						color:		'#ff0000',
						duration:	2
					});					
				}
				break;
			
			
			// file handling like pdf etc.				
			case 'FILES':
				
				Ti.Platform.openURL(args.link);	
				break;
			
			
			// external apps or something else than link	
			case 'EXTERNAL':
			
				Ti.Platform.openURL(args.link);	
				break;
			
			
			// in app views				
			case 'INAPP':
				
				Ti.Platform.openURL(args.link);
				break;
				
			
			default:
			
				// DEBUG WARN
				Ti.API.warn('[ApplicationController]._handleWebViewClick(): Link from type "' + (args.linkType || 'EMPTY') + '" would be handled by default');
				
				Ti.Platform.openURL(args.link);
				break;
		}
	}
	
	return;
	
}; // END _handleWebViewClick()


/**
 * Handles app wide notification view processing
 * 
 * @private
 * @method _handleNotification
 * @param {Object} args
 * @return void
 */
function _handleNotification(args) {
	
	// DEBUG
	Ti.API.debug('[ApplicationController]._handleNotification():args = ' + JSON.stringify(args));
	
	
	// load toolbox
	var Tools = require('/helpers/common/tools');
	
	if (Tools.isIOS) {
		
		// instantiate loading view
		var loadingView = require('de.marcelpociot.mwkprogress');
			
		
		// dismiss			
		if (args.dismiss && args.dismiss === true) {
			
			loadingView.dismiss();
			
			return;
		}
		
		
		// update message & progress
		if (args.update && args.update === true) {
			
			args.progress && loadingView.updateProgress(args.progress);
			args.message && loadingView.updateMessage(args.message);
			
			return;				
		}
		
		
		if (args.message) {
			
			args.color && args.duration && loadingView.showMessageWithColorDuration(args);
			args.color && loadingView.showMessageWithColor(args);				
		}
		else {
			
			loadingView.show();
		}
	}
	else if (Tools.isAndroid) {
		
		// instantiate loading view
		var loadingView = require('de.manumaticx.crouton');
		
			
		// dismiss			
		if (args.dismiss && args.dismiss === true) {
			
			loadingView.cancelAllCroutons();
			
			return;
		}
		
		
		if (args.message) {
			
			if (args.style) {
				
				args.style = loadingView['STYLE_' + args.style.toUpperCase()];
				args.text = args.message;
									
				delete args.message;
				
				if (args.duration) {
					
					args.duration = (1000 * args.duration);
				}
				
				loadingView.show(args);
			} 
			else {
				
				args.style = loadingView.STYLE_INFO;
				loadingView.show(args);
			}
		}
	}
	
	return;
	
} // END _handleNotification()


/**
 * Loads, creates and processes website window openeing
 * 
 * @private
 * @method _loadWebsiteWindow
 * @param {Object} options
 * @return void 
 */
function _loadWebsiteWindow(options) {

	// load requirements and variable initialization
	var Tools =				require('/helpers/common/tools'),
		globals =			require('/helpers/common/globals').global,
		
		actions =			globals.action,
		websiteOptions =	undefined;
		
	
	// set website url
	switch (options.action) {
		
		case actions.SOCIAL_DETAIL_SCREEN:
			
			var EPWindow = 	require('/ui/windows/' + Tools.osname.toLowerCase() + '/EPWindow'),
				
				window = new EPWindow({
					
					title:				L('windowTitleSocialMedia'),
					backButtonTitle:	''
				});
				
			window.setLeftNavButton(null);
			
			websiteOptions = {
				
				webView: {
					url: String.format(globals.externalPaths.redirect, encodeURI(options.recordData && options.recordData.link))
				},
				
				customWindowObj: 	window,	
				fetchDocumentTitle:	false
			};
			
			break;
		
		
		case actions.SPECIAL_SCREEN:
		
			var EPWindow = 	require('/ui/windows/' + Tools.osname.toLowerCase() + '/EPWindow'),
				
				window = new EPWindow({
					
					title: L('windowTitleSpezial')
				});
				
			websiteOptions = {
				
				webView: {
					url: globals.externalPaths.spezial
				},
				
				customWindowObj: 	window,	
				fetchDocumentTitle:	false,
				showToolbar:		false
			};
			
			options.openAsCenterWindow = true;
		
			break;
		
			
		case actions.DONATE_SCREEN:
		
			var EPWindow = 	require('/ui/windows/' + Tools.osname.toLowerCase() + '/EPWindow'),
				
				window = new EPWindow({
					
					title: L('windowTitleDonate')
				});
				
			websiteOptions = {
				
				webView: {
					url: globals.externalPaths.donate
				},
				
				customWindowObj: 	window,	
				fetchDocumentTitle:	false,
				showToolbar:		false
			};
			
			options.openAsCenterWindow = true;
		
			break;
			
			
		case actions.CONTACT_SCREEN:
			
			var EPWindow = 	require('/ui/windows/' + Tools.osname.toLowerCase() + '/EPWindow'),
				
				window = new EPWindow({
					
					title: L('windowTitleContact')
				});
				
			websiteOptions = {
				
				webView: {
					url: globals.externalPaths.contact
				},
				
				customWindowObj: 	window,	
				fetchDocumentTitle:	false,
				showToolbar:		false
			};
			
			options.openAsCenterWindow = true;
			
			break;
			
			
		case actions.IMPRINT_SCREEN:
			
			var EPWindow = 	require('/ui/windows/' + Tools.osname.toLowerCase() + '/EPWindow'),
				
				window = new EPWindow({
					
					title: L('windowTitleImprint')
				});
				
			websiteOptions = {
				
				webView: {
					url: globals.internalPaths.imprint,
					willHandleTouches:	false
				},
				
				customWindowObj: 	window,	
				fetchDocumentTitle:	false,
				showToolbar:		false
			};
			
			options.openAsCenterWindow = true;
			
			break;
			
			
		case actions.PRIVACY_POLICY_SCREEN:
			
			var EPWindow = 	require('/ui/windows/' + Tools.osname.toLowerCase() + '/EPWindow'),
				
				window = new EPWindow({
					
					title: L('windowTitlePrivacyPolicy')
				});
				
			websiteOptions = {
				
				webView: {
					url:				globals.internalPaths.privacyPolicy,
					willHandleTouches:	false
				},
				
				customWindowObj: 	window,	
				fetchDocumentTitle:	false,
				showToolbar:		false
			};
			
			options.openAsCenterWindow = true;
			
			break;
		
		
		default:
		
			if (Tools.type(options.url) === 'string' && options.url.length) {
				
				websiteOptions = {
					
					webView: {
						
						url:	options.url
					}
				};
			}
			
			break;
	}
	
	
	// DEBUG
	Ti.API.debug('[ApplicationController]._loadWebsiteWindow():options =', options);
	Ti.API.debug('[ApplicationController]._loadWebsiteWindow():websiteOptions =', websiteOptions);
	
	
	// if options given process window opening
	if (websiteOptions) {
		
		// load and create browser window
		var BrowserScreen =	require('/ui/windows/default/MiniBrowser'),
			browserWindow =	new BrowserScreen(Tools.merge(websiteOptions, options));
		
		
		// processing screen opening
		_windowHandler(Tools.merge({
	
			window: browserWindow.getWindow()
	
	    }, options));
	    
	    
	    // release variables
	    websiteOptions = null;
	}
	else {
		
		// DEBUG ERROR
		Ti.API.error('[ApplicationController]._loadWebsiteWindow():No URL is given! Options =', options);
	}
	
	return;
	
} // END _loadWebsiteWindow()


/**
 * Handles app navigation flow
 * 
 * @private
 * @method _navigateApp 
 * @param {Object} args
 * @return void
 */
function _navigateApp(args) {
	
	var Tools =		require('/helpers/common/tools'),
		actions =	require('/helpers/common/globals').global.action,
		
		action =	(Tools.type(args.action) === 'string' && args.action.length ? args.action.toUpperCase().trim() : '');
	
	
	switch (action) {
		
		case actions.HANDLE_NOTIFICATION:
		
			_handleNotification(args);
			break;

		
		case actions.HOME_SCREEN:
		
			_loadHomeScreen(args);
			break;
			
		
		case actions.ON_AIR_SCREEN:
		
			_loadOnAirWindow(args);
			break;
			
			
		case actions.BACKSTAGE_SCREEN:
			
			_loadBackstageScreen(args);
			break;
			
			
		case actions.MEDIA_LIBRARY_SCREEN:
		
			_loadMediaLibraryScreen(args);
			break;
			
			
		case actions.DETAIL_SCREEN:
		
			_loadDetailScreen(args);
			break;
			
			
		case actions.SOCIAL_SCREEN:
		
			_loadSocialScreen(args);
			break;
			
			
		case actions.PLAYLIST_SCREEN:
			
			_loadPlaylistScreen(args);
			break;
			
			
		case actions.SOCIAL_DETAIL_SCREEN:
		case actions.WEBSITE_SCREEN:
		case actions.CONTACT_SCREEN:
		case actions.SPECIAL_SCREEN:
		case actions.DONATE_SCREEN:
		case actions.IMPRINT_SCREEN:
		case actions.PRIVACY_POLICY_SCREEN:
		case actions.BROWSER_SCREEN:
		
			_loadWebsiteWindow(args);
			break;
		
		
		case actions.ALARM_CLOCK_SCREEN:
		
			_loadAlarmClockScreen(args);
			break;
			
			
		case actions.SETTINGS_SCREEN:
		
			_loadSettingsScreen(args);
			break;
		
		
		case actions.NAVIGATE_BACK:
		 
			_navigateBack(args);
			break;
		
		
		case actions.TOGGLE_MENU:
			
			if (_applicationDrawer) {
				_applicationDrawer.toggleLeftWindow();
			}
			break;
		
		
		case actions.TOGGLE_APP_OVERFLOW_MENU:
		
			if (_appContextMenu) {
				
				_appContextMenu.toggle();
			}
			break;	
		
		
		case actions.OPEN_DRAWER:
		
			if (_applicationDrawer) {
				
				_applicationDrawer.open();
			}
			break;	
			
			
		case actions.SET_DRAWER_PROPERTY:
			
			_setDrawerProperty(args);
			break;			
			
			
		default:
			
			if (_applicationDrawer && _applicationDrawer.isLeftWindowOpen()) {
				
				_applicationDrawer.toggleLeftWindow();
			}
			
			break;
	}
	
	return;
	
} // END _navigateApp()


/**
 * Navigates back in the window history
 * if possible otherwise stays at last window
 * 
 * @private
 * @method _navigateBack
 * @param {Object} options
 * @return void
 */
function _navigateBack(options) {
	
	if (_navigationController) {
		
		var _processBack = function() {
			
			// remove app wide event listener
			Ti.App.removeEventListener('app:applicationDrawerMenuClosed', _processBack);


			// process back navigation
			_navigationController.back(options.stepsBack || 1);
			
			
			// include toolbox
			var Tools =		require('/helpers/common/tools'),
				globals =	require('/helpers/common/globals').global;
			
			
			// iOS
			if (Tools.isIOS) {
				
				// iOS: reset statusbar style	
				_applicationDrawer.setStatusBarStyle(globals.applicationDrawer.iOS.STATUSBAR_WHITE);
			
			
				// home screen extras
				var isHomescreen = (_navigationController.windowStack.length === 2);
				
				if (isHomescreen) {
					
					// enable open gestures for home screen
					if (_applicationDrawer) {
						
						_applicationDrawer.setOpenDrawerGestureMode(globals.applicationDrawer.iOS.OPEN_MODE_ALL);	
					}
					
					
					// iOS: fire focus event for home screen
					setTimeout(function() {
						
						_navigationController.windowStack[0].fireEvent('focus');
						
					}, 400);	
				}
			}
			
			return;
			
		}; // END _processBack()
		
		
		// process back navigation after drawer menu is closed or directly
		if (_applicationDrawer && _applicationDrawer.isLeftWindowOpen()) {
			
			Ti.App.addEventListener('app:applicationDrawerMenuClosed', _processBack);
			
			_applicationDrawer.toggleLeftWindow();
		}
		else {
			
			_processBack();
		}
	}
	
	return;
	
} // END _navigateBack()


/**
 * Handler window openeing and closing
 * 
 * @private
 * @method _windowHandler
 * @param {Object} options
 * @return void
 */
function _windowHandler(options) {
	
	var _processOpening = function () {
		
		// remove app event listener
		Ti.App.removeEventListener('app:applicationDrawerMenuClosed', _processOpening);
		
		
		// load toolbox
		var Tools = require('/helpers/common/tools');
		
		
		// FIXME: Fixed setting of standalone for all Android windows is bullshit, should be handled on window load
		if (Tools.isAndroid) {
			options.standalone = true;
		}
		
		
		// process opening
		if (options.openAsCenterWindow === true) {
			
			// release old navigation controller
			_navigationController = null;
			
			
			// create a new one 
			var NavigationController = require('/control/NavigationController');
			
			_navigationController = new NavigationController({
				
				shouldFirstWindowExit: false
			});
			
			
			// add window
			_navigationController.add(options.window); 
			
			
			// and add this as center window for drawer
			_applicationDrawer.setCenterWindow(_navigationController.navigationWindow);
			
		}	
		else if (options.standalone === true) {
			
			options.window.open(options.standaloneOpenOptions || {});
		}
		else if (options.modal === true) {
			
			// create a new navigation controller
			var NavigationController = require('/control/NavigationController'),
			
				modalNavigationController = new NavigationController({
					
					modal:					true,
					shouldFirstWindowExit:	false
				});
			
			
			// add window
			modalNavigationController.add(options.window);
			
			options.window.navigationWindow = modalNavigationController.navigationWindow;
			
			
			// open navigation controller
			modalNavigationController.navigationWindow.open(options.modalOpenOptions || {});
			
		}
		else if (_navigationController) {
			
			// workaround to open windows from sidemenu, if there are already opened windows besides homescreen
			if (options.openFromHome === true && _navigationController.windowStack.length > 1) {
				
				_navigationController.openFromHome(options.window);
			}
			else {
				
				_navigationController.open(options.window);
			}
			
			
			// iOS: disable open gestures for all subsequent windows start from home screen
			if (Tools.isIOS) {
								
				if (_applicationDrawer) {
					
					var globals = require('/helpers/common/globals').global;
						
					_applicationDrawer.setOpenDrawerGestureMode(globals.applicationDrawer.iOS.OPEN_MODE_NONE);
				}
			}
		}

		
		return;
		
	}; // END _processOpening()

	
	// process window opening after drawer menu is closed or directly	
	if (_applicationDrawer && _applicationDrawer.isLeftWindowOpen()) {
		
		// add left drawer close event listener 
		Ti.App.addEventListener('app:applicationDrawerMenuClosed', _processOpening);
		
		
		// close drawer to bump up opening of window		
		_applicationDrawer.toggleLeftWindow();
	}
	else {
		
		_processOpening();
	}
		
	return;
	
} // END _windowHandler()


/**
 * Sets property with value that are given
 * from argument
 * 
 * @private
 * @method _setDrawerProperty
 * @param {Object} options
 * @return void
 */
function _setDrawerProperty(options) {
	
	var Tools = require('/helpers/common/tools');
	
	if (Tools.type(options) === 'object' 
		&& Tools.type(options.propertyName) === 'string'
			&& options.propertyName.length 
				&& Tools.type(options.propertyValue) !== 'undefined'
					&& Tools.type(options.propertyValue) !== 'null'
						&& Tools.type(_applicationDrawer[options.propertyName]) !== 'undefined') {
		
		
		if (Tools.type(_applicationDrawer[options.propertyName]) === 'function') {
			
			_applicationDrawer[options.propertyName](options.propertyValue);
		}
		else {
			
			_applicationDrawer[options.propertyName] = options.propertyValue;
		}
	}
	
	return;
	
} // END _setDrawerProperty()


/**
 * App resumed callback
 * 
 * @private
 * @method _resumeApp
 * @return void
 */
function _resumeApp() {
	
	// include requirements
	var Tools = require('/helpers/common/tools');
	
	
	// iOS specific
	if (Tools.isIOS) {
		
		// test if iTunes app update is given and 
		// ask user to update if necessary
		var iTunesUpdater = require('/helpers/app/iTunesUpdater');
		
		iTunesUpdater.test();
	}
	
	return;
	
} // END _resumeApp()


/**
 * Network change callback, that fires custom app wide event
 * for network change
 * 
 * @private
 * @method _onNetworkChange
 * @param {Object} networkChangeEvent
 * @return void
 */
function _onNetworkChange(networkChangeEvent) {
	
	// DEBUG
	Ti.API.debug('[AppController]._onNetworkChange():networkChangeEvent =', networkChangeEvent);
	
	
	Ti.App.fireEvent('app:networkChange', networkChangeEvent);
	
	return;
	
} // END _onNetworkChange()



/**
 * Adds app event listener
 * 
 * @private
 * @method _addAppListener
 * @return void
 */
function _addAppListener() {
	
	// load toolbox
	var Tools = require('/helpers/common/tools');
	
	// for Android attach resume event listening 
	// to current used/visible/active activity 
	if (Tools.isAndroid) {
		
		Ti.Android.currentActivity.addEventListener('resume', _resumeApp);
	}
	else {
		
		Ti.App.addEventListener('resumed', _resumeApp);
	}
	
	Ti.App.addEventListener('app:navigate', _navigateApp);
	Ti.App.addEventListener('app:webViewClick', _handleWebViewClick);
	
	Ti.Network.addEventListener('change', _onNetworkChange);	
	
	return;
	
} // END _addAppListener()


/**
 * Removes app event listener
 * 
 * @private
 * @method _removeAppListener
 * @return void 
 */
function _removeAppListener() {
	
	// load toolbox
	var Tools = require('/helpers/common/tools');
	
	
	// for Android detach resume event listening
	// from current used/visible/active activitiy
	if (Tools.isAndroid) {
		
		Ti.Android.currentActivity.removeEventListener('resume', _resumeApp);
	}
	else {
		
		Ti.App.removeEventListener('resumed', _resumeApp);
	}

	Ti.App.removeEventListener('app:navigate', _navigateApp);
	Ti.App.removeEventListener('app:webViewClick', _handleWebViewClick);
	
	Ti.Network.removeEventListener('change', _onNetworkChange);
	
	return;
	
} // END _removeAppListener()


/**
 * Assign custom app event listener and starts app flow
 * 
 * @public
 * @method startApp
 * @return void
 */
exports.startApp = function() {
	
	// add app event listeners
	_addAppListener();
	
	
	// require Tools
	var Tools =		require('/helpers/common/tools'),
		globals =	require('/helpers/common/globals').global;
	
	
	// build up navigation controller
	if (!_navigationController) {
		
		// require NavigationController module
		var NavigationController = require('/control/NavigationController');
		
		_navigationController = new NavigationController({
			
			shouldFirstWindowExit: false
		});
	}
	
	
	// instantiate database provider
    var DatabaseProvider =  require('/model/services/DatabaseProvider'),
        database =          new DatabaseProvider(globals.databaseName);
	

	// init database
	// database.init();
	

	// load home screen
	Tools.navigateApp({
		action:	globals.action.HOME_SCREEN
	});
	
	
	return;
	
}; // END startApp()
