/*
 * WebView.js
 *
 * /Resources/ui/common/default/WebView.js
 *
 * This is a module that helps to create an internal browser view
 * in the application.
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

/**
 * WebView
 *
 * Example:
 *   var WebView = require("/ui/common/default/WebView");
 *
 *   new WebView({
 * 		initOnCreation:	true,
 * 		url:			"http://www.google.com",
 *   });
 *
 * @constructor
 * @method WebView
 * @param {Map/Dictonary} args
 * @return {WebView} this
 */
function WebView(args) {

	// load toolbox
	var Tools = require('/helpers/common/tools');


	// import the stylesheet
	var Stylesheet =	require('/ui/Stylesheet'),

	    _styles =		new Stylesheet(),
	    _stylesheet =	_styles.init();

	Stylesheet =	null;
	_styles =		null;


	// merge params
	this._options = Tools.merge({

		initOnCreation:     true,
		zIndex:             88, // WebView zIndex
		enableZoomControls: false

	}, args);


	// varialbe declaration
	this.url = this._options.url;
	delete this._options.url;

	this._reloadURL = this.url;

	this.initOnCreation = (this._options.initOnCreation === true);
	delete this._options.initOnCreation;

	this.isInizialized = false;
	this.hasError = false;
	this._reload = false;


	// protect context
	var that = this;


	// create element container
	this.viewProxy = Ti.UI.createView(_stylesheet.webView.viewProxy);


	// Android: add element container event listener for
	// Android cause the Android drawer module fires postlayout event
	if (Tools.isAndroid && this.initOnCreation === true) {

		this.viewProxy.addEventListener('postlayout', _onFocus);
	}


	// add ViewPager event callbacks
	this.viewProxy.addEventListener('viewPagerActive', function(args) {

		// fire tracking event
		require('/helpers/analytics/ga').screen([L('windowTitleBackstage'), args.tab].join('/'));


		if (that.isInizialized === true) {

			// add network change event listener
			require('/helpers/app/EventDispatcher').on('app:networkChange', that._handleNetworkChanges);
		}


		// enables scrolls to top
		if (require('/helpers/common/tools').isIOS) {

			that._webView.scrollsToTop = true;
		}


		that.init();

		return;
	});

	this.viewProxy.addEventListener('viewPagerInactive', function(args) {

		// add network change event listener
		require('/helpers/app/EventDispatcher').off('app:networkChange', that._handleNetworkChanges);


		// disable scrolls to top, so other views in viewpager
		// could scroll to top on status bar tap
		if (require('/helpers/common/tools').isIOS) {

			that._webView.scrollsToTop = false;
		}

		return;
	});


	// create notification view
	var Notification = require('/ui/common/default/Notification');

	this._notification = new Notification({

		parent:	this.viewProxy
	});

	Notification = null;


	// Android: create loading view
	if (Tools.isAndroid) {

		var TiSmoothProgressBar = require('com.artanisdesign.tismoothprogressbar');

		this._loadingBar = TiSmoothProgressBar.createSmoothProgressBar(_stylesheet.webView._loadingBar);

		this.viewProxy.add(this._loadingBar);

		TiSmoothProgressBar = null;
	}


	// create web view
	this._webView = Ti.UI.createWebView(this._options);


	// add webview event listener
	this._webView.addEventListener('load', _onWebViewLoadStateChange);
	this._webView.addEventListener('beforeload', _onWebViewLoadStateChange);
	this._webView.addEventListener('error', _onWebViewLoadStateChange);


	// add webview to element
	this.viewProxy.add(this._webView);


	// iOS Hack: for iOS the postlayout callback must be called
	// manually, cause the drawer module does not fire postlayout
	// or open event
	if (Tools.isIOS && this.initOnCreation === true) {

		_onFocus.call(this.viewProxy);
	}


	/**
	 * Web view load, before load, error callbacks
	 *
	 * @private
	 * @method _onWebViewLoadStateChange
	 * @param {Object} event
	 * @return void
	 */
	function _onWebViewLoadStateChange(event) {

		// load toolbox
		var Tools = require('/helpers/common/tools');


		if (event && event.type) {

			var isLoading = false;

			switch (event.type) {

				case 'beforeload':

					// DEBUG
					Ti.API.debug('[WebView]._onWebViewLoadStateChange():BEFORE load');


					// show activity indicator
					if (Tools.isAndroid) {

						that._loadingBar.show();
					}

					var isRemoteURL = Tools.isURL(event.url);

					// save reload url
					if (isRemoteURL) {

						that._reloadURL = event.url;
					}

					isLoading = true;


					// show loading message
					if (that._notification.isVisible === true && isRemoteURL) {

						that._notification.show({

							text:  L('webViewRequestConnect'),
							color: '#ffa500'
						});
					}

					break;


				case 'load':
				case 'error':

					// hide loading indicator
					if (Tools.isAndroid) {

						that._loadingBar.hide();
					}


					// process if error given
					if (event.type === 'error' && !event.success) {

						// for Android show blank page, to hide default error message
						if (Tools.isAndroid) {

							that._webView.setUrl(require('/helpers/common/globals').internalPaths.error);
						}


						// update error state
						that.hasError = true;

						var notificationOptions = {

							text:       (event.message || L('webViewDefaultLoadErrorMessage')),
							color:      '#ff0000',
							duration:   2
						};


						// fetch network connection state
						var isDisconnected = false;

						if (Tools.isIOS) {

							isDisconnected = ((event.errorCode && event.errorCode === -1009) || (event.code && event.code === -1009));
						}
						else {

							isDisconnected = !Tools.hasNetworkConnectivity();
						}


						// if error is caused by not given any network connection
						// set reload flag
						if (isDisconnected) {

							notificationOptions.duration = undefined;
							notificationOptions.text = L('webViewRequestDisconnected', 'No network connection');

							that._reload = true;
						}


						// show up error notification
						that._notification.show(notificationOptions);


						if (Tools.isIOS) {

							// stop loading
							that._webView.stopLoading();
						}
					}


					// DEBUG
				Ti.API.debug('[WebView]._onWebViewLoadStateChange()', 'event.type', event.type, 'event.success', event.success, 'notification visible?', that._notification.isVisible, 'first if?', (event.type === 'load' && (Tools.isAndroid || event.success)), 'second if?', (that._notification.isVisible && (Tools.isIOS || !that.hasError)), 'notification visible?', that._notification.isVisible);


					if (event.type === 'load') {

						// show up load notification
						if (that._notification.isVisible && (Tools.isIOS || !that.hasError)) {

							that._notification.show({

								text:		L('webViewRequestConnected'),
								color:		'#4ead54',
								duration:   1
							});
						}


						that._reload = (Tools.isAndroid ? that.hasError : false);
					}

					break;
			}
		}

		return;

	} // END _onWebViewLoadStateChange()


	/**
	 * Handles network change events
	 *
	 * @private
	 * @method _handleNetworkChanges
	 * @param {Object} networkChangeEvent
	 * @return void
	 */
	this._handleNetworkChanges = function(networkChangeEvent) {

		if (networkChangeEvent.online) {

			// re-init webview
			that.init();
		}

		return;

	}; // END _handleNetworkChanges()


	/**
	 * Focus callback
	 *
	 * @private
	 * @method _onFocus
	 * @param {Object} focusEvent
	 * @return void
	 */
	function _onFocus(focusEvent) {

		// remove event listener
		this.removeEventListener('postlayout', _onFocus);


		// init webview
		setTimeout(function() {

			that.init();

		}, 250);


		return;


	} // END _onFocus()


	// memory management
	_stylesheet = null;


	return this;

} // END WebView()



/**
 * Starts loading if not already done
 *
 * @public
 * @method init
 * @return void
 */
WebView.prototype.init = function() {

	// set webview url to load
	if (!this.isInizialized) {

		// set webview url
		this._webView.setUrl(this._reloadURL);


		// update init state
		this.isInizialized = true;


		// add network change event listener
		require('/helpers/app/EventDispatcher').on('app:networkChange', this._handleNetworkChanges);
	}


	if (this.isInizialized && this._reload === true) {

		this.hasError = false;

		require('/helpers/common/tools').isAndroid ? this._webView.setUrl(this._reloadURL) : this._webView.reload();
	}

	return;

}; // END init()


/**
 * Memory Management
 *
 * @public
 * @method destroy
 * @return void
 */
WebView.prototype.destroy = function() {

	// load toolbox
	var Tools = require('/helpers/common/tools');


	// hide notification
	this._notification.hide();


	// remove event listener
	this._webView.removeEventListener('beforeload', this._onWebViewLoadStateChange);
	this._webView.removeEventListener('error', this._onWebViewLoadStateChange);
	this._webView.removeEventListener('load', this._onWebViewLoadStateChange);

	require('/helpers/app/EventDispatcher').off('app:networkChange', this._handleNetworkChanges);


	// clean views
	this._webView.stopLoading();
	this._webView.hide();


	if (Tools.isAndroid) {

		this._loadingBar.hide();
		this.viewProxy.remove(this._loadingBar);

		this._loadingBar = null;

		this._webView.pause();
		this._webView.release();
	}

	this.viewProxy.remove(this._notification.viewProxy);
	this.viewProxy.remove(this._webView);


	// release variables for GC
	this._notification = null;
	this._webView = null;
	Tools = null;


	return;

}; // END destroy()


// provide public access to module
module.exports = WebView;
