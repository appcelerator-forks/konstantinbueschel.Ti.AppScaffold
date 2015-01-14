/*
 * ApplicationController.js
 *
 * /Resources/control/ApplicationController.js
 *
 * This module controls the flow of the app.
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

// private statefull variables
var _navigationController, _applicationDrawer, _appContextMenu,
    _isDrawerOpened = false;
//    _isNotificationListenerAttached = false;

if (require('/helpers/common/tools').isAndroid) {

	var _androidRootWindow, _androidMenu, _updateProperties = false;
}


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


	// default params
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

					toRecipients: [args.link],

					subject:     (args.subject || ''),
					messageBody: (args.message || '')
				});

				if (emailDialog.isSupported()) {

					emailDialog.open();
				}
				else {

					// show notification
					Tools.navigateApp({

						action:		require('/helpers/common/globals').action.HANDLE_NOTIFICATION,

						message:	L('emailDialogNotSupported'),
						color:		'#ff0000',
						style:      'ALERT',
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

				switch (args.view.toUpperCase()) {

					case 'MINIBROWSER':

						_loadWebsiteWindow({

							url: String.format(require('/helpers/common/globals').externalPaths.redirect, encodeURI(args.link))
						});

						break;

					default:

						Ti.Platform.openURL(args.link);
						break;
				}

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

			// parse message
			args.text = args.message;

			delete args.message;


			// parse duration
			if (args.duration) {

				args.duration = (1000 * args.duration);
			}


			// bind to correct activity
			if (_navigationController.windowStack.length > 1) {

				args.activity = _navigationController.windowStack[_navigationController.windowStack.length - 1].activity;
			}
			else {

				args.activity = _androidRootWindow.activity;
			}


			// parse style or show default info
			if (args.style) {

				args.style = loadingView['STYLE_' + args.style.toUpperCase()];


				// DEBUG
			Ti.API.debug('[ApplicationController]._handleNotification():', Object.keys(args), JSON.stringify(args));


				loadingView.show(args);
			}
			else {

				args.style = loadingView.STYLE_ERF_INFO;


				// DEBUG
			Ti.API.debug('[ApplicationController]._handleNotification():', Object.keys(args), JSON.stringify(args));


				loadingView.show(args);
			}
		}
	}

	return;

} // END _handleNotification()


/**
 * Shows up email dialog with app infos as request to support
 *
 * @private
 * @method _handleSupportRequest
 * @param {Dictonary} args
 * @return void
 */
function _handleSupportRequest(args) {

	var Globals = require('/helpers/common/globals'),
	    appInfo = require('/helpers/common/tools').getAppInfo(),

	    emailDialog = Ti.UI.createEmailDialog({

		    toRecipients: [Globals.emailAdresses.support],
		    subject:      L('supportEmailSubject'),
		    messageBody:  String.format(L('supportEmailMessage'), appInfo.appName, appInfo.appVersion, appInfo.device, appInfo.osVersion, appInfo.osType, appInfo.osLocale, appInfo.architecture, (appInfo.memory + 0.01), appInfo.UUID, appInfo.appSessionID, appInfo.tiBuild)
	    });


	if (emailDialog.isSupported()) {

		// fire analytics event
		require('/helpers/analytics/ga').event(L('analyticsEventCategoryInAppSettings'), L('analyticsEventActionOpen'), L('settingsTitleSupport'));


		emailDialog.open();
	}
	else {

		// fire analytics event
		require('/helpers/analytics/ga').event(L('analyticsEventCategoryInAppSettings'), L('analyticsEventActionFailed'), L('settingsTitleSupport'));


		if (require('/helpers/common/tools').isAndroid) {

			Ti.UI.createNotification({

				message:  L('settingsViewErrorMessageSupportEmail'),
				duration: Ti.UI.NOTIFICATION_DURATION_SHORT

			}).show();
		}
		else {

			Ti.UI.createAlertDialog({

				title:   L('settingsViewErrorTitleSupportEmail'),
				message: L('settingsViewErrorMessageSupportEmail')

			}).show();
		}
	}


	// GC
	Globals = null;
	appInfo = null;


	return;

} // END _handleSupportRequest()


/**
 * Drawer open callback - fire generalized app drawer open event
 *
 * @private
 * @method _onDrawerOpen
 * @param {Object} drawerOpenEvent
 * @return void
 */
function _onDrawerOpen(drawerOpenEvent) {

	// fire app wide menu opend event
	require('/helpers/app/EventDispatcher').trigger('app:applicationDrawerMenuOpened');


	// updates drawer opened state
	_isDrawerOpened = true;

	return;

} // END _onDrawerOpen()


/**
 * Drawer close callback - fire generalized app drawer close event
 *
 * @private
 * @method _onDrawerClose
 * @param {Object} drawerCloseEvent
 * @return void
 */
function _onDrawerClose(drawerCloseEvent) {

	// fire app wide menu closed event
	require('/helpers/app/EventDispatcher').trigger('app:applicationDrawerMenuClosed');


	// updates drawer opened state
	_isDrawerOpened = false;

	return;

} // END _onDrawerClose()


/**
 * Handles closing of Android root window
 *
 * @private
 * @method _handleAndroidRootWindowClose
 * @param {}
 * @return void
 */
function _handleAndroidRootWindowClose() {

	_applicationDrawer.toggleLeftWindow();

	return;

} // END _handleAndroidRootWindowClose()


/**
 * Android actionbar overflow menu alias app
 * context menu item click callback - Delegates
 * opening of app views depend on event.appAction
 * property
 *
 * @private
 * @method _handleAndroidContextMenuSelection
 * @param {Object} selectionEvent
 * @return void
 */
function _handleAndroidContextMenuSelection(selectionEvent) {

	// DEBUG
Ti.API.debug('[ApplicationController]._handleAndroidContextMenuSelection():', JSON.stringify(selectionEvent), Object.keys(this));


	if (this && this.itemId) {

		// load toolbox and delegate opening of app view
		var Globals = require('/helpers/common/globals'),
		    appAction;


		switch (this.itemId) {

			case Globals.menu.Android.ITEM_ID_SETTINGS:

				appAction = Globals.action.SETTINGS_SCREEN;
				break;


			case Globals.menu.Android.ITEM_ID_PRIVACY_POLICY:

				appAction = Globals.action.PRIVACY_POLICY_SCREEN;
				break;


			case Globals.menu.Android.ITEM_ID_IMPRINT:

				appAction = Globals.action.IMPRINT_SCREEN;
				break;


			case Globals.menu.Android.ITEM_ID_SUPPORT:

				appAction = Globals.action.HANDLE_SUPPORT_REQUEST;
				break;


			default:

				// DEBUG ERROR
				Ti.API.error('[ApplicationController]._handleAndroidContextMenuSelection():No item ID ("',  this.itemId, '") mapping found - process without handling this item click');
				break;
		}


		// delegate app navigation
		if (appAction) {

			require('/helpers/common/tools').navigateApp({

				action: appAction.trim()
			});
		}


		// GC
		Globals = null;
		appAction = null;
	}

	return;

} // END _handleAndroidContextMenuSelection()


/**
 * Removes previous view menu items - for the moment
 * only for Android and only menu items with groupId
 * GROUP_ID_VIEW_MENU (see globals)
 *
 * @private
 * @method _removePreviousMenuItems
 * @return void
 */
function _removePreviousMenuItems() {

	// remove previous view menu items
	if (require('/helpers/common/tools').isAndroid && _androidMenu) {

		_androidMenu.removeGroup(require('/helpers/common/globals').menu.Android.GROUP_ID_VIEW_MENU);
	}

	return;

} // END _removePreviousMenuItems()


/**
 * Depend on menu android drawer opened or close,
 * ActionBar title and menu item visibility
 *
 * @private
 * @method _toggleActionBarUI
 * @param {Boolean} drawerOpenedOverride
 * @return void
 */
function _updateMenu(drawerOpenedOverride) {

	var Tools = require('/helpers/common/tools');

	if (_applicationDrawer && Tools.isAndroid && _androidMenu) {

		var Globals = require('/helpers/common/globals'),
		    isDrawerOpened = (Tools.type(drawerOpenedOverride) === 'boolean' ? drawerOpenedOverride : _isDrawerOpened);


		if (isDrawerOpened) {

			_androidMenu.getMenu().setGroupVisible(Globals.menu.Android.GROUP_ID_VIEW_MENU, false);
			_androidMenu.getActionBar().setTitle(Ti.App.getName());
		}
		else {

			_androidMenu.getMenu().setGroupVisible(Globals.menu.Android.GROUP_ID_VIEW_MENU, true);

			if (_androidRootWindow) {

				_androidMenu.getActionBar().setTitle(_androidRootWindow.getTitle());
			}
		}


		// GC
		Globals = null;
		isDrawerOpened = null;
	}


	// GC
	Tools = null;

	return;

} // END _toggle


/**
 * Handles app navigation flow
 *
 * @private
 * @method _navigateApp
 * @param {Object} args
 * @return void
 */
function _navigateApp(args) {

	var Tools = require('/helpers/common/tools'),
	    actions = require('/helpers/common/globals').action,

	    action = (Tools.type(args.action) === 'string' && args.action.length ? args.action.toUpperCase().trim() : '');


	switch (action) {

		case actions.HANDLE_NOTIFICATION:

			_handleNotification(args);
			break;


		case actions.HANDLE_SUPPORT_REQUEST:

			_handleSupportRequest(args);
			break;


		case actions.HOME_SCREEN:

			_loadHomeScreen(args);
			break;


		case actions.DETAIL_SCREEN:

			_loadDetailScreen(args);
			break;


		case actions.WEBSITE_SCREEN:
		case actions.CONTACT_SCREEN:
		case actions.IMPRINT_SCREEN:
		case actions.PRIVACY_POLICY_SCREEN:
		case actions.BROWSER_SCREEN:

			_loadWebsiteWindow(args);
			break;


		case actions.SETTINGS_SCREEN:

			_loadSettingsScreen(args);
			break;


		case actions.NAVIGATE_BACK:

			_navigateBack(args);
			break;


		case actions.TOGGLE_MENU:

			if (_applicationDrawer) {

				// fire analytics event
				require('/helpers/analytics/ga').event(L('analyticsEventCategoryMainMenu'), L('analyticsEventActionButtonPress'), (_isDrawerOpened ? L('analyticsEventActionClose') : L('analyticsEventActionOpen')));


				_applicationDrawer.toggleLeftWindow();
			}

			break;


		case actions.CLOSE_MENU:

			if (_applicationDrawer && _isDrawerOpened) {

				_applicationDrawer.toggleLeftWindow();
			}

			break;


		case actions.TOGGLE_APP_OVERFLOW_MENU:

			if (_appContextMenu) {

				// fire analytics event
				require('/helpers/analytics/ga').event(L('analyticsEventCategoryContextMenu'), L('analyticsEventActionButtonPress'), (_appContextMenu.isVisible ? L('analyticsEventActionClose') : L('analyticsEventActionOpen')));


				_appContextMenu.toggle();
			}

			break;


		case actions.CONTEXT_MENU_SELECTION:

			if (Tools.isAndroid) {

				_handleAndroidContextMenuSelection.apply((args.source || {}), args.data);
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


		case actions.REMOVE_PREVIOUS_MENU_ITEMS:

			_removePreviousMenuItems();
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
			require('/helpers/app/EventDispatcher').off('app:applicationDrawerMenuClosed', _processBack);


			// process back navigation
			_navigationController.back(options.stepsBack || 1);


			return;

		}; // END _processBack()


		// process back navigation after drawer menu is closed or directly
		if (_applicationDrawer && _isDrawerOpened) {

			require('/helpers/app/EventDispatcher').on('app:applicationDrawerMenuClosed', _processBack);

			_applicationDrawer.toggleLeftWindow();
		}
		else {

			_processBack();
		}
	}

	return;

} // END _navigateBack()


/**
 * Handles window opening and closing
 *
 * @private
 * @method _windowHandler
 * @param {Object} options
 * @return void
 */
function _windowHandler(options) {

	/**
	 * View opening processing
	 *
 	 * @private
	 * @method _processOpening
	 * @return void
	 */
	function _processOpening() {

		// remove app event listener
		require('/helpers/app/EventDispatcher').off('app:applicationDrawerMenuClosed', _processOpening);


		// load toolbox
		var Tools = require('/helpers/common/tools');


		// process opening
		if (options.openAsCenterWindow === true) {

			// iOS
			if (Tools.isIOS) {

				// release old navigation controller
				_navigationController = null;


				// create a new one
				var NavigationController = require('/control/NavigationController');

				_navigationController = new NavigationController({

					shouldFirstWindowExit: false
				});

				NavigationController = null;


				// add window
				_navigationController.add(options.window);


				// update open gestures
				_applicationDrawer.setOpenDrawerGestureMode(require('/helpers/common/globals').applicationDrawer.iOS.OPEN_MODE_BEZEL_PANNING_CENTERWINDOW);


				// fetch previous window to close it and release the memory
				var previousWindow = _applicationDrawer.getCenterWindow();


				// and add this as center window for drawer
				_applicationDrawer.setCenterWindow(_navigationController.navigationWindow);


				// GC
				previousWindow.getWindow().fireEvent('close');
				previousWindow = null;

			}
			// Android
			else if (Tools.isAndroid) {

				// fetch previous view to close it and release the memory
				var previousView = _applicationDrawer.centerView;


				// add new center view
				_applicationDrawer.setCenterView(options.view);


				// DEBUG
				Ti.API.debug('[ApplicationController]._windowHandler():previousView =', previousView, 'view', options.view);


				// GC
				previousView && previousView.fireEvent('destroy');
				previousView = null;
			}
		}
		else if (options.standalone === true) {

			options.window.open(options.standaloneOpenOptions || {});
		}
		else if (options.modal === true) {

			if (Tools.isIOS) {

				// create a new navigation controller
				var NavigationController = require('/control/NavigationController'),

				    modalNavigationController = new NavigationController({

					    modal:					true,
					    shouldFirstWindowExit:	false
				    });

				NavigationController = null;


				// add window
				modalNavigationController.add(options.window);

				options.window.navigationWindow = modalNavigationController.navigationWindow;


				// open navigation controller
				modalNavigationController.navigationWindow.open(options.modalOpenOptions || {});
			}
			else {

				options.window.open();
			}
		}
		else if (_navigationController) {

			// workaround to open windows from sidemenu
			// if there are already opened windows besides homescreen
			if (options.openFromHome === true && _navigationController.windowStack.length > 1) {

				_navigationController.openFromHome(options.window, {

					swipeBack:       true,
					displayHomeAsUp: true
				});
			}
			else {

				_navigationController.open(options.window, {

					swipeBack:       true,
					displayHomeAsUp: true
				});
			}
		}


		return;

	} // END _processOpening()


	// load toolbox
	var Tools = require('/helpers/common/tools');


	// Android
	if (Tools.isAndroid) {

		// cause Android only has one root window,
		// set this window title to "view title"
		if (options.title) {

			_androidRootWindow.setTitle(options.title);
		}


		// attach activity state listener / Android context
		if (options.window) {

			require('/helpers/app/Context').track(options.window);
		}
	}


	// DEBUG
	Ti.API.debug('[ApplicationController]._windowHandler()', 'iOS?', Tools.isIOS, '_applicationDrawer?', _applicationDrawer, 'drawer opened?', _isDrawerOpened);


	// process window opening after drawer menu is closed or directly
	var isDrawerOpen = (Tools.isIOS ? (_applicationDrawer && _applicationDrawer.isLeftWindowOpen()) : (_applicationDrawer && _isDrawerOpened));


	// GC
	Tools = null;


	if (isDrawerOpen === true) {

		// add left drawer close event listener
		require('/helpers/app/EventDispatcher').on('app:applicationDrawerMenuClosed', _processOpening);


		// close drawer to bump up opening of window
		_navigateApp({
			action: require('/helpers/common/globals').action.TOGGLE_MENU
		});
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
 * @param {Object} args
 * @return void
 */
function _resumeApp(args) {

	// DEBUG
	Ti.API.debug('[ApplicationController]._resumeApp()');


	// iOS
	if (require('/helpers/common/tools').isIOS) {

		require('/helpers/app/EventDispatcher').trigger('app:didBecomeActive');


		if (Ti.App.deployType === 'production') {

			// test if iTunes app update is given and
			// ask user to update if necessary
			var iTunesUpdater = require('/helpers/app/iTunesUpdater');

			iTunesUpdater.test();
		}


		// add local notification listener
		/*if (!_isNotificationListenerAttached) {

			Ti.App.iOS.addEventListener('notification', _onLocalNotification);

			_isNotificationListenerAttached = true;
		}*/
	}
	// Android
	else if (require('/helpers/common/tools').isAndroid) {

		// DEBUG
		Ti.API.debug('[ApplicationController]._resumeApp():Android:', Object.keys(args || {}));


		require('/helpers/app/EventDispatcher').trigger('app:didBecomeActive');


		// start radio if needed
		var appStartData = require('/helpers/common/tools').getPersistentData({

			    type:        'Object',
			    property:    'appStartData',
			    defaultData: {

				    openView:   false,
				    viewToOpen: ''
			    }
		    });


		// checks if activity was resumed by statusbar notification
		// and open view if given in intent extras
		_openFromIntent();


		// fire focus event
		require('/helpers/app/EventDispatcher').trigger('app:windowFocus');


		if (_updateProperties) {

			_handleAppPropertyChange();

			_updateProperties = false;
		}


		return;
	}


	return;

} // END _resumeApp()


/**
 * App paused callback
 *
 * @private
 * @method _pauseApp
 * @param {Object} args
 * @return void
 */
function _pauseApp(args) {

	// DEBUG
	Ti.API.debug('[ApplicationController]._pauseApp():', 'type?', args.type);


	// iOS
	if (require('/helpers/common/tools').isIOS) {

		if (args.type === 'pause') {

			require('/helpers/app/EventDispatcher').trigger('app:willResignActive');
		}
		else {

			// remove local notification
			/*if (_isNotificationListenerAttached) {

				Ti.App.iOS.removeEventListener('notification', _onLocalNotification);

				_isNotificationListenerAttached = false;
			}*/

			require('/helpers/app/EventDispatcher').trigger('app:didEnterBackground');
		}
	}
	// Android
	else if (require('/helpers/common/tools').isAndroid) {

		// DEBUG
		Ti.API.debug('[ApplicationController]._pauseApp():Android:', Object.keys(args || {}));


		if (args.type === 'pause') {

			require('/helpers/app/EventDispatcher').trigger('app:willResignActive');
		}
		else {

			require('/helpers/app/EventDispatcher').trigger('app:didEnterBackground');
		}
	}


	return;

} // END _pauseApp()


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


	require('/helpers/app/EventDispatcher').trigger('app:networkChange', networkChangeEvent);


	return;

} // END _onNetworkChange()


/**
 * Ti.App.Properties change callback
 *
 * @private
 * @method _handleAppPropertyChange
 * @param {Object} propertyChangeEvent
 * @return void
 */
function _handleAppPropertyChange(propertyChangeEvent) {

	propertyChangeEvent = (propertyChangeEvent || {});


	// trigger app wide event for property change
	require('/helpers/app/EventDispatcher').trigger('app:propertyChange');


	// lookup if google optout settings is changed
	// and update it
	var Tools = require('/helpers/common/tools'),
	    Globals = require('/helpers/common/globals'),

	    googleOptOut = !(Tools.getPersistentData({

		    type:        'Bool',
		    property:    Globals.FIXTURES.settings[1].property,
		    defaultData: !!Globals.FIXTURES.settings[1].defaultValue
	    })),

	    GA = require('/helpers/analytics/ga');


	// update Google Analytics optOut
	if (GA.proxy().optOut !== googleOptOut) {

		GA.setOptOut(googleOptOut);
	}


	// GC
	Tools = null;
	Globals = null;
	googleOptOut = null;
	GA = null;


	return;

} // END _handleAppPropertyChange()


/**
 * Adds app event listener
 *
 * @private
 * @method _addAppListener
 * @return void
 */
function _addAppListener() {

	// add app event listener
	Ti.App.addEventListener('resumed', _resumeApp);
	Ti.App.addEventListener('pause', _pauseApp);
	Ti.App.addEventListener('paused', _pauseApp);


	if (require('/helpers/common/tools').isIOS) {

		Ti.App.Properties.addEventListener('change', _handleAppPropertyChange);


		// add local notification listener
		/*if (!_isNotificationListenerAttached) {

			Ti.App.iOS.addEventListener('notification', _onLocalNotification);

			_isNotificationListenerAttached = true;
		}*/
	}
	else if (require('/helpers/common/tools').isAndroid) {

		Ti.App.addEventListener('destroy', function() {

			// DEBUG
			Ti.API.debug('[ApplicationController]._androidRootWindowActivityDestroy()');


			// remove event listener
			this.removeEventListener('destroy', arguments.callee);


			// clean up current center view
			var currentCenterView = _applicationDrawer.centerView;

			currentCenterView && currentCenterView.fireEvent('destroy');

			currentCenterView = null;


			// remove app listener
			_removeAppListener();


			return;
		});
	}


	var EventDispatcher = require('/helpers/app/EventDispatcher');

	EventDispatcher.on('app:navigate', _navigateApp);
	EventDispatcher.on('app:webViewClick', _handleWebViewClick);
	EventDispatcher.on('app:closeRootWindow', _handleAndroidRootWindowClose);

	Ti.App.addEventListener('app:webViewClick', _handleWebViewClick);
	Ti.Network.addEventListener('change', _onNetworkChange);


	// GC
	EventDispatcher = null;


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


	// remove app event listener
	Ti.App.removeEventListener('resumed', _resumeApp);
	Ti.App.removeEventListener('pause', _pauseApp);
	Ti.App.removeEventListener('paused', _pauseApp);


	// for Android detach resume event listening
	// from current used/visible/active activity
	if (!Tools.isAndroid) {

		Ti.App.Properties.removeEventListener('change', _handleAppPropertyChange);


		// remove local notification listener
		/*if (_isNotificationListenerAttached) {

			Ti.App.iOS.removeEventListener('notification', _onLocalNotification);

			_isNotificationListenerAttached = false;
		}*/
	}


	var eventDispatcher = require('/helpers/app/EventDispatcher');

	eventDispatcher.off('app:navigate', _navigateApp);
	eventDispatcher.off('app:webViewClick', _handleWebViewClick);
	eventDispatcher.off('app:closeRootWindow', _handleAndroidRootWindowClose);

	Ti.App.removeEventListener('app:webViewClick', _handleWebViewClick);
	Ti.Network.removeEventListener('change', _onNetworkChange);


	// memory management
	eventDispatcher = null;
	Tools = null;

	return;

} // END _removeAppListener()


/**
 *
 * @private
 * @method _onLocalNotification
 * @param {Object} notificationEvent
 * @return void
 */
/*function _onLocalNotification(notificationEvent) {

	return;

} // END _onLocalNotification()*/


/**
 * Require and open home screen here
 *
 * @private
 * @method _loadHomeScreen
 * @param {Object} options
 * @return void
 */
function _loadHomeScreen(options) {

	// include toolbox
	var Tools = require('/helpers/common/tools'),
	    Globals = require('/helpers/common/globals');


	// variable declaration
	var drawerEvents = {
		    open:  '',
		    close: ''
	    },
	    drawerOptions, DrawerModule,
	    appContextMenuData = Globals.menu.APP_CONTEXT_MENU_DATA;


    // iOS: Load 'n' create context menu and iOS drawer
	if (Tools.isIOS) {

		// create main menu
		var MenuWindow = require('/ui/windows/iphone/MenuWindow'),
		    menuWindow = new MenuWindow();


		// require and load homescreen view
		var firstWindow = require('/ui/windows/iphone/FirstWindow').createWindow();


		// add window to navigation controller
		_navigationController.add(firstWindow);


		// create context menu
		var ContextMenu = require('/ui/common/iphone/ContextMenu');

		_appContextMenu = new ContextMenu({
			data: appContextMenuData
		});


		// require drawer module
		DrawerModule = require('dk.napp.drawer');


		// instantiate drawer
		drawerOptions = {

			leftWindow:				menuWindow,
			centerWindow:			_navigationController.navigationWindow,

			closeDrawerGestureMode:	DrawerModule.CLOSE_MODE_ALL,
			openDrawerGestureMode:	DrawerModule.OPEN_MODE_BEZEL_PANNING_CENTERWINDOW,

			showShadow:				false,
			shouldStretchDrawer:	false,

			leftDrawerWidth:		137,

			animationMode:			DrawerModule.ANIMATION_PARALLAX_FACTOR_3,

			statusBarStyle:			DrawerModule.STATUSBAR_BLACK, // remember to set UIViewControllerBasedStatusBarAppearance to false in tiapp.xml
			orientationModes:		[Ti.UI.PORTRAIT]
		};

		drawerEvents.open = 'windowDidOpen';
		drawerEvents.close = 'windowDidClose';


		// GC
		ContextMenu = null;
		MenuWindow = null;
		menuWindow = null;
		firstWindow = null;

	}
	// Android: Load 'n' create Android drawer
	else if (Tools.isAndroid) {

		// require drawer module
		DrawerModule = require('com.tripvi.drawerlayout');


		// build up menu view
		var MenuView = require('/ui/common/default/MenuView'),
		    menu = new MenuView({selectedItemIndex: 0});


		// create OnAir view
		var FirstView = require('/ui/common/default/FirstView'),
		    firstView = new FirstView();


		// define drawer options
		drawerOptions = {

			leftView:   menu,
			centerView: firstView.viewProxy,

			width:  Ti.UI.FILL,
			height: Ti.UI.FILL,

			leftDrawerWidth:        137,
			drawerIndicatorEnabled: true,

			backgroundColor: '#ffffff'
		};

		drawerEvents.open = 'draweropen';
		drawerEvents.close = 'drawerclose';


		// GC
		MenuView = null;
		menu = null;
		FirstView = null;
		firstView = null;
	}


	// create application drawer
	_applicationDrawer = DrawerModule.createDrawer(drawerOptions);


	// add application drawer event listener
	_applicationDrawer.addEventListener(drawerEvents.open, _onDrawerOpen);
	_applicationDrawer.addEventListener(drawerEvents.close, _onDrawerClose);


	// add additional Android drawer event listener
	if (Tools.isAndroid) {

		/**
		 * Drawer slide callback - updates Android menu item
		 * visibility and title
		 *
		 * @private
		 * @method _onDrawerSlide
		 * @param {Object} slideEvent
		 * @return void
		 */
		function _onDrawerSlide(slideEvent) {

			// update Android menu item visibility and title
			_updateMenu(Boolean(slideEvent.offset > 0.5));

			return;

		} // END _onDrawerSlide()


		_applicationDrawer.addEventListener('drawerslide', _onDrawerSlide);
	}


	// GC
	DrawerModule = null;
	drawerOptions = null;
	drawerEvents = null;


	// open application drawer
	if (Tools.isIOS) {

		_applicationDrawer.open();
	}
	else if (Tools.isAndroid) {

		/**
		 * ActionBar icon click callback - Toggles drawer
		 *
		 * @private
		 * @method _onHomeIconItemSelected
		 * @param {Object} homeItemSelectedEvent
		 * @return void
		 */
		function _onHomeIconItemSelected(homeIconItemSelectedEvent) {

			// toggle drawer left window
			require('/helpers/common/tools').navigateApp({

				action:	require('/helpers/common/globals').action.TOGGLE_MENU
			});

			return;

		} // END _onHomeIconItemSelected()


		// create root window and add drawer to it
		_androidRootWindow = require('/ui/windows/android/RootWindow').createWindow();

		_androidRootWindow.setTitle(L('windowTitleFirstWindow'));
		_androidRootWindow.add(_applicationDrawer);


		// add Android Context
		require('/helpers/app/Context').track(_androidRootWindow);


		// add root window event listener
		_androidRootWindow.addEventListener('open', function(openEvent) {

			// remove event listener
			this.removeEventListener(openEvent.type, arguments.callee);


			_openFromIntent();


			return;
		});


		// setup Android actionbar
		var Menu = require('/helpers/app/menu');

		_androidMenu = new Menu(_androidRootWindow);

		_androidMenu.getActionBar().on('homeIconItemSelected', _onHomeIconItemSelected);


		// setup Android menu
		appContextMenuData.forEach(function(contextMenuItemData) {

			var options = contextMenuItemData.options;

			_androidMenu.add({

				title:   options.title,
				itemId:  options.itemId,
				groupId: options.groupId,

				showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER,
				onClick:      _handleAndroidContextMenuSelection
			});

			options = null;

			return;

		}, this);


		// GC
		Globals = null;


		// open root window
		_navigationController.open(_androidRootWindow, {

			activityEnterAnimation: Ti.Android.R.anim.fade_in
		});
	}

	return;

} // END _loadHomeScreen()


// FIXME: Dummy method for loading a screen
/**
 * Loads screen
 *
 * @private
 * @method _loadExampleView
 * @return
 */
function _loadExampleView(options) {

	// load requirements and variable initialization
	var Tools = require('/helpers/common/tools'),
	    windowOptions = {
		    openAsCenterWindow: true
	    };


	// define window/view/screen to show
	if (Tools.isAndroid) {

		// remove previous view menu items
		_removePreviousMenuItems();


		// create OnAir view
		var ExampleView =	require('/ui/common/default/ExampleView'),
		    exampleView =	new ExampleView();

		ExampleView = null;


		windowOptions.view = exampleView.viewProxy;
		windowOptions.title = L('windowTitleExampleView');
	}
	else {

		windowOptions.window = require('/ui/windows/' + Tools.osname.toLowerCase() + '/ExampleWindow').createWindow();
	}


	// processing screen opening
	_windowHandler(Tools.merge(windowOptions, options));


	return;

} // END _loadExampleView()


// FIXME: Dummy method for loading a screen
/**
 * Loads screen
 *
 * @private
 * @method _loadExampleViewII
 * @param {Map/Dictonary} options
 * @return void
 */
function _loadExampleViewII(options) {

	// load requirements and variable initialization
	var Tools = require('/helpers/common/tools'),
	    windowOptions = {

			openAsCenterWindow: true
	    };


	// define window/view/screen to show
	if (Tools.isAndroid) {

		// remove previous view menu items
		_removePreviousMenuItems();


		windowOptions.view = require('/ui/common/default/ExampleView').createView({

			menu: _androidMenu

		}).viewProxy;

		windowOptions.title = L('windowTitleExampleView');
	}
	else {

		windowOptions.window = require('/ui/windows/' + Tools.osname.toLowerCase()  + '/ExampleView').createWindow();
	}


	// processing screen opening
	_windowHandler(Tools.merge(windowOptions, options));


	return;

} // END _loadExampleViewII()


/**
 * Loads detail screen for given type in options
 *
 * @private
 * @method _loadDetailScreen
 * @param {Object} options
 * @return void
 */
function _loadDetailScreen(options) {

	// load requirements
	var Tools =		require('/helpers/common/tools'),
		globals =	require('/helpers/common/globals');


	// delegate opening of window
	switch (options.detailFor) {

		// FIXME: Dummy method for loading detail screen
		case globals.detailScreen.EXAMPLE:

			_windowHandler(Tools.merge({

				window:	require('/ui/windows/' + Tools.osname.toLowerCase() + '/ExampleDetailWindow').createWindow(options)

			}, options));

			break;


		default:

			// DEBUG WARNING
		Ti.API.warn('[ApplicationController]._loadDetailScreen(): No handler found for "detailFor" = "' + options.detailFor + '" option!');

			break;
	}


	return;

} // END _loadDetailScreen()


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
	var Tools = require('/helpers/common/tools'),
	    Globals = require('/helpers/common/globals'),

	    actions = Globals.action,
	    websiteOptions = undefined;


	// set website url
	switch (options.action) {

		// FIXME: Dummy method for loading website screen
		case actions.EXAMPLE_DETAIL_SCREEN:

			var Window = require('/ui/windows/' + Tools.osname.toLowerCase() + '/Window'),

			    window = new Window({

				    title:           L('windowTitleExampleDetail'),
				    backButtonTitle: '',
				    exitOnClose:     false
			    });


			websiteOptions = {

				webView: {
					url: String.format(Globals.paths.external.redirect, encodeURI(options.recordData && options.recordData.link))
				},

				fetchDocumentTitle: false,
				customWindowObj:    window
			};


			if (Tools.isIOS) {

				window.setLeftNavButton(null);


				// set drawer open mode to only navbar
				Tools.navigateApp({

					action:			Globals.action.SET_DRAWER_PROPERTY,

					propertyName:	'setOpenDrawerGestureMode',
					propertyValue:	Globals.applicationDrawer.iOS.OPEN_MODE_NONE
				});
			}
			else if (Tools.isAndroid) {

				/**
				 * Android action bar overflow menu alias app
				 * context menu item click callback - Delegates
				 * opening of app views depend on event.appAction
				 * property
				 *
				 * @private
				 * @method _handleContextMenuSelection
				 * @param {Object} selectionEvent
				 * @return void
				 */
				function _handleContextMenuSelection(selectionEvent) {

					require('/helpers/common/tools').navigateApp({

						action: require('/helpers/common/globals').action.CONTEXT_MENU_SELECTION,
						source: this,
						data:   selectionEvent
					});

					return;

				} // END _handleContextMenuSelection()


				// app context menu
				websiteOptions.additionalAndroidMenuItems = require('/helpers/common/globals').menu.APP_CONTEXT_MENU_DATA.map(function(contextMenuItemData) {

					var options = contextMenuItemData.options;

					return {

						title:   options.title,
						itemId:  options.itemId,
						groupId: options.groupId,

						showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER,
						onClick:      _handleContextMenuSelection
					};

				}, this);
			}


			// fire tracking event
			require('/helpers/analytics/ga').screen([L('windowTitleExampleDetail'), options.recordData.platform, options.recordData.id].join('/'));

			break;


		case actions.CONTACT_SCREEN:

			if (Tools.isAndroid) {

				// remove previous menu items
				_removePreviousMenuItems();


				websiteOptions = {

					initOnCreation: true,
					url:            Globals.paths.external.contact
				};

				options.title = L('windowTitleContact');
			}
			else {

				var Window = require('/ui/windows/' + Tools.osname.toLowerCase() + '/Window'),

				    window = new Window({

					    title: L('windowTitleContact')
				    });

				websiteOptions = {

					webView: {
						url: Globals.externalPaths.contact
					},

					customWindowObj: 	window,
					fetchDocumentTitle:	false,
					showToolbar:		false
				};
			}

			options.openAsCenterWindow = true;


			// fire tracking event
			require('/helpers/analytics/ga').screen(L('windowTitleContact'));

			break;


		case actions.IMPRINT_SCREEN:

			var openAsCenterWindow = true;


			if (Tools.isAndroid) {

				openAsCenterWindow = false;


				var Window = require('/ui/windows/' + Tools.osname.toLowerCase() + '/Window'),

				    window = new Window({

					    title:       L('windowTitleImprint'),
					    exitOnClose: false
				    });


				websiteOptions = {

					webView: {
						url: Globals.paths.internal.imprint
					},

					fetchDocumentTitle: false,
					customWindowObj:    window,
					showToolbar:        false
				};
			}
			else {

				// deselect left drawer menu items
				require('/helpers/app/EventDispatcher').trigger('app:applicationDrawerMenuDeselect');


				var Window = require('/ui/windows/' + Tools.osname.toLowerCase() + '/Window'),

				    window = new Window({

					    title: L('windowTitleImprint')
				    });


				websiteOptions = {

					webView: {
						url: Globals.internal.imprint
					},

					customWindowObj: 	window,
					fetchDocumentTitle:	false,
					showToolbar:		false
				};
			}

			options.openAsCenterWindow = openAsCenterWindow;


			// fire tracking event
			require('/helpers/analytics/ga').screen(L('windowTitleImprint'));

			break;


		case actions.PRIVACY_POLICY_SCREEN:

			var openAsCenterWindow = true;


			if (Tools.isAndroid) {

				openAsCenterWindow = false;


				var Window = require('/ui/windows/' + Tools.osname.toLowerCase() + '/Window'),

				    window = new Window({

					    title:       L('windowTitlePrivacyPolicy'),
					    exitOnClose: false
				    });


				websiteOptions = {

					webView: {
						url: Globals.paths.internal.privacyPolicy
					},

					fetchDocumentTitle: false,
					customWindowObj:    window,
					showToolbar:        false
				};
			}
			else {

				// deselect left drawer menu items
				require('/helpers/app/EventDispatcher').trigger('app:applicationDrawerMenuDeselect');


				var Window = require('/ui/windows/' + Tools.osname.toLowerCase() + '/Window'),

				    window = new Window({

					    title: L('windowTitlePrivacyPolicy')
				    });

				websiteOptions = {

					webView: {
						url: Globals.paths.internal.privacyPolicy
					},

					customWindowObj: 	window,
					fetchDocumentTitle:	false,
					showToolbar:		false
				};
			}

			options.openAsCenterWindow = openAsCenterWindow;


			// fire tracking event
			require('/helpers/analytics/ga').screen(L('windowTitlePrivacyPolicy'));

			break;


		default:

			if (Tools.type(options.url) === 'string' && options.url.length) {

				if (Tools.isAndroid && options.openAsCenterWindow) {

					websiteOptions = {

						initOnCreation: true,
						url:            options.url
					};
				}
				else {

					websiteOptions = {

						webView: {

							url:	options.url
						}
					};
				}


				// fire tracking event
				require('/helpers/analytics/ga').screen([L('analyticsScreenViewMiniBrowser'), options.url].join('/'));
			}

			break;
	}


	// GC
	Globals = null;


	// if options given process window opening
	if (websiteOptions) {

		if (!websiteOptions.webView) {

			var WebView = require('/ui/common/default/WebView'),
			    webView = new WebView(Tools.merge(websiteOptions, options));

			options.view = webView.viewProxy;


			// GC
			WebView = null;
			webView = null;
		}
		else {

			// load and create browser window
			var BrowserScreen =	require('/ui/windows/default/MiniBrowser'),
			    browserWindow =	new BrowserScreen(Tools.merge(websiteOptions, options));

			options.window = browserWindow.getWindow();


			// GC
			BrowserScreen = null;
			browserWindow = null;
		}


		// GC
		websiteOptions = null;
		Tools = null;


		// processing screen opening
		_windowHandler(options);
	}
	else {

		// DEBUG ERROR
		Ti.API.error('[ApplicationController]._loadWebsiteWindow():No URL is given! Options =', JSON.stringify(options));
	}

	return;

} // END _loadWebsiteWindow()


// FIXME: Dummy method for loading screen with list view
/**
 * Loads list view screen
 *
 * @private
 * @method _loadExampleListView
 * @param {Map/Dictonary} options
 * @return void
 */
function _loadExampleListView(options) {

	// load requirements and variable initialization
	var Tools = require('/helpers/common/tools'),

	    windowOptions = {
		    openAsCenterWindow: true
	    };


	// define window/view/screen to show
	if (Tools.isAndroid) {

		// remove previous view menu items
		_removePreviousMenuItems();


		// create social media list view
		var Globals = require('/helpers/common/globals'),
		    ExampleListView = require('/ui/common/android/ExampleListView'),

		    exampleListView = new ExampleListView({

			    dataURL: String.format(Globals.api.urlPattern, Globals.api.dataEndPoint.EXAMPLE),
			    menu:    _androidMenu
		    });


		// setup window handler options
		windowOptions.view = exampleListView.viewProxy;
		windowOptions.title = L('windowTitleExampleListView');


		// GC
		Globals = null;
		ExampleListView = null;
		exampleListView = null;
	}
	else {

		windowOptions.window = require('/ui/windows/' + Tools.osname.toLowerCase()  + '/ExampleListViewWindow').createWindow();
	}


	// processing screen opening
	_windowHandler(Tools.merge(windowOptions, options));


	return;

} // END _loadExampleListView()


/**
 * Loads settings screen
 *
 * @private
 * @method _loadSettingsScreen
 * @param {Map/Dictonary} options
 * @return void
 */
function _loadSettingsScreen(options) {

	// load toolbox
	var Tools = require('/helpers/common/tools');


	if (Tools.isAndroid) {

		// fire tracking event
		require('/helpers/analytics/ga').screen(L('windowTitleSettings'));

		_updateProperties = true;

		Ti.UI.Android.openPreferences();
	}
	else {

		// processing screen opening
		_windowHandler(Tools.merge({

			window:		require('/ui/windows/' + Tools.osname.toLowerCase()  + '/SettingsWindow').createWindow(),
			modal:		true

		}, options));
	}


	// GC
	Tools = null;


	return;

} // END _loadSettingsScreen()


/**
 * Checks if activity was resumed by statusbar notification
 * and open view if given in intent extras. Currently
 * only for radio notification - Android only
 *
 * @private
 * @method _openFromIntent
 * @return void
 */
function _openFromIntent() {

	// load tools
	var Tools = require('/helpers/common/tools');

	if (Tools.isAndroid) {

		var appStartData = Tools.getPersistentData({

			    type:        'Object',
			    property:    'appStartData',
			    defaultData: {

				    openView:   false,
				    viewToOpen: ''
			    }
		    }),

		    openView = appStartData.openView,
		    viewToOpen = appStartData.viewToOpen;


		// DEBUG
		Ti.API.debug('[ApplicationController]._openFromIntent()', 'openView?', openView, 'viewToOpen?', viewToOpen);


		// open view
		if (openView && viewToOpen && viewToOpen.length) {

			_navigationController.home();

			_androidMenu.getActionBar().setTitle(L('windowTitleFirstWindow'));

			require('/helpers/app/EventDispatcher').trigger('app:applicationDrawerMenuTriggerSelection', {

				rowIndex: 1
			});
		}


		// reset intent extras
		appStartData.openView = false;
		appStartData.viewToOpen = '';

		Tools.saveDataPersistent({

			type:     'Object',
			property: 'appStartData',
			data:     appStartData
		});
	}


	return;

} // END _openFromIntent()


/**
 * Assign custom app event listener and starts app flow
 *
 * @public
 * @method launch
 * @param {String} schemeURL
 * @return void
 */
exports.launch = function(schemeURL) {

	// DEBUG
	Ti.API.debug('[ApplicationController].launch()', 'schemeURL', schemeURL);


	// add app event listeners
	_addAppListener();


	// require Tools
	var Tools = require('/helpers/common/tools'),
	    Globals = require('/helpers/common/globals');


	// build up navigation controller
	if (!_navigationController) {

		// require NavigationController module
		var NavigationController = require('/control/NavigationController');

		_navigationController = new NavigationController({

			swipeBack:             false,
			shouldFirstWindowExit: true
		});
	}


	// instantiate database provider
	var DatabaseProvider = require('/model/services/DatabaseProvider'),
	    database = new DatabaseProvider(Globals.databaseName);

	// init database
	database.init();


	// GC
	DatabaseProvider = null;
	database = null;


	// init Google Analytics tracking
	var GA = require('/helpers/analytics/ga');

	GA.id = Globals.tracking.id;

	GA.setOptOut(!(Tools.getPersistentData({

		type:        'Bool',
		property:    Globals.FIXTURES.settings[1].property,
		defaultData: !!Globals.FIXTURES.settings[1].defaultValue
	})));

	GA.setDryRun(Globals.tracking.dryRun);
	GA.setLogLevel(Globals.tracking.logLevel);


	// update app version in settings app
	Tools.saveDataPersistent({

		property: 'AppVersionSettings',
		data:     Tools.appVersionShort
	});


	// add crash reporter for adhoc and production releases
	if (Ti.Platform.deployType === 'production') {

		require('/helpers/app/crashreporter');
	}


	// load home screen
	Tools.navigateApp({

		action:	Globals.action.HOME_SCREEN
	});


	// installr updater - only for Beta testing
	require('/helpers/app/installrUpdater').autocheck(Tools.isIOS ? Globals.installrAppToken : Globals.installrAppTokenAndroid);


	// GC
	Tools = null;
	Globals = null;
	GA = null;

	return;

}; // END launch()