/*
 * MiniBrowser.js
 *
 * /Resources/ui/windows/default/MiniBrowser.js
 *
 * This is a module that helps to create an internal browser window
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
 * MiniBrowser class
 *
 * Example:
 *   var TiMiniBrowser = require("/ui/windows/default/MiniBrowser");
 *
 *   new TiMiniBrowser({
 *
 *		window: {
 * 			barColor: "#FF0000",
 * 			...
 *		},
 *
 * 		webView: {
 * 			url: "http://www.rafaelks.com",
 * 			...
 * 		}
 *
 *   }).open();
 *
 *
 * @constructor
 * @method MiniBrowser
 * @param {Object} options
 * @return {MiniBrowser} this
 */
function MiniBrowser(options) {

	// import the stylesheet
    var Stylesheet =	require('/ui/Stylesheet'),
		Tools =			require('/helpers/common/tools'),

		styles =		new Stylesheet(),
		stylesheet =	styles.init();


	// merge params
	this.options = Tools.merge({

		window:    stylesheet.miniBrowser.window,
		viewProxy: stylesheet.miniBrowser.viewProxy,
		webView:   stylesheet.miniBrowser.webView,

		showToolbar:        true,
		fetchDocumentTitle: true,
		replaceBackButton:  false,
		windowBased:        true, // only Android relevant

		customWindowObj: undefined,
		menu:            undefined // only Android relevant

	}, options);


	// variable initialization
	this.components = {};
	this.url = (this.options.webView.url);
	this.isInitialized = false;
	this.hasError = false;
	this._reload = false;
	this._reloadURL = this.url;
	this.components.initialRightNavButtons = [];

	this._isWindowBased = this.options.windowBased;

	delete this.options.webView.url;
	delete this.options.windowBased;

	var menu = undefined;

	// protect "this"
	var that = this;


	// create window
	if (Tools.isIOS) {

		// create activity indicator
		this.components.activityIndicator = Ti.UI.createActivityIndicator(stylesheet.miniBrowser.activityIndicator);
		this.components.activityIndicator.show();


		// create window
		if (this.options.customWindowObj && this.options.customWindowObj.apiName === 'Ti.UI.Window') {

			this.components.viewProxy = this.options.customWindowObj;

			this.components.initialRightNavButtons = this.components.viewProxy.getRightNavButtons();

			this.components.viewProxy.setRightNavButtons(this.components.initialRightNavButtons.concat(this.components.activityIndicator));
		}
		else {

			this.components.viewProxy = Ti.UI.createWindow(Tools.merge({

				rightNavButton: this.components.activityIndicator

			}, this.options.window));
		}
	}
	else if (Tools.isAndroid) {

		if (this._isWindowBased) {

			// create window
			if (this.options.customWindowObj && this.options.customWindowObj.apiName === 'Ti.UI.Window') {

				this.components.viewProxy = this.options.customWindowObj;
			}
			else {

				this.components.viewProxy = Ti.UI.createWindow(this.options.window);
			}


			// setup ActionBar and menu
			var Menu = require('/helpers/app/menu');

			menu = new Menu(this.components.viewProxy);
		}
		else {

			// create parent view
			this.components.viewProxy = Ti.UI.createView(this.options.viewProxy);

			menu = this.options.menu;
		}


		// add additional menu items from args
		if (menu && this.options.additionalAndroidMenuItems) {

			this.options.additionalAndroidMenuItems.forEach(function(contextMenuItemData) {

				menu.add(contextMenuItemData);

				return;

			}, this);
		}



		// create loading
		var TiSmoothProgressBar = require('com.artanisdesign.tismoothprogressbar');

		this.components.loadingBar = TiSmoothProgressBar.createSmoothProgressBar(stylesheet.miniBrowser.loadingBar);

		this.components.viewProxy.add(this.components.loadingBar);

		TiSmoothProgressBar = null;
	}


	// create close button if window is modal
	if (this.options.window.modal === true && (!Tools.isAndroid || this._isWindowBased)) {

		// create close button
		this.components.closeButton = Ti.UI.createButton({

			title: L('miniBrowserButtonCloseTitle')
		});

		// set as window left nav button
		if (Tools.isIOS) {

			this.components.viewProxy.setLeftNavButton(this.components.closeButton);
		}

		// add click callback
		this.components.closeButton.addEventListener('click', _onCloseButtonClick);


		/**
		 * Close button click callback
		 *
		 * @private
		 * @method _onCloseButtonClick
		 * @param {Object} clickEvent
		 */
		function _onCloseButtonClick(clickEvent) {

			that.components.viewProxy.close();

			return;

		} // END _onCloseButtonClick()

	}
	else if (Tools.isIOS && this.options.replaceBackButton === true) {

		// back button replacement
	    this.components.backButton = Ti.UI.createButton(stylesheet.backNavBarButton);

	    this.components.viewProxy.setLeftNavButton(this.components.backButton);

	    this.components.backButton.addEventListener('click', function(clickEvent) {

			// navigate back
			Tools.navigateApp({
				action: require('/helpers/common/globals').action.NAVIGATE_BACK
			});
	    });
	}


	// create notification view
	var Notification = require('/ui/common/default/Notification');

	this.components.notification = new Notification({

		parent:	this.components.viewProxy
	});

	Notification = null;


	// add view proxy event listener
	this.components.viewProxy.addEventListener((!Tools.isAndroid || this._isWindowBased ? 'open' : 'postlayout'), _onWindowFocus);


	// create web view
	this.components.webView = Ti.UI.createWebView(Tools.merge({

		bottom:              (this.options.showToolbar === true ? (stylesheet.miniBrowser.toolbar.height || 44) : 0),
		disableBounce:       true,
		softKeyboardOnFocus: (Tools.isAndroid ? Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS : '')

	}, options.webView));


	// create toolbar components
	if (this.options.showToolbar === true) {

		// holds all toolbar elements
		this.components.toolbarElements = {};


		// create social share button
		_addSocialShareCapabilities(menu);


		// set social share button enabled state
		if (this.components.toolbarElements.buttonAction) {

			this.components.toolbarElements.buttonAction.setEnabled(false);
		}


		// create neccessary buttons
		this.components.toolbarElements.buttonBack =	Ti.UI.createButton(stylesheet.miniBrowser.buttonBack);
		this.components.toolbarElements.buttonForward =	Ti.UI.createButton(stylesheet.miniBrowser.buttonForward);
		this.components.toolbarElements.buttonStop =	Ti.UI.createButton(stylesheet.miniBrowser.buttonStop);
		this.components.toolbarElements.buttonRefresh =	Ti.UI.createButton(stylesheet.miniBrowser.buttonRefresh);


		// iOS specific toolbar creation
		if (Tools.isIOS) {

			// spacer
			this.components.toolbarElements.buttonSpace =	Ti.UI.createButton(stylesheet.miniBrowser.buttonSpace);


			// create toolbar
			this.components.toolbar = Ti.UI.iOS.createToolbar(Tools.merge({

				items: [

					this.components.toolbarElements.buttonBack,
					this.components.toolbarElements.buttonSpace,
					this.components.toolbarElements.buttonForward,
					this.components.toolbarElements.buttonSpace,
					this.components.toolbarElements.buttonRefresh,
					this.components.toolbarElements.buttonSpace,
					this.components.toolbarElements.buttonAction
				]

			}, stylesheet.miniBrowser.toolbar));


			// add toolbar to window
			this.components.viewProxy.add(this.components.toolbar);
		}
		else {

			this.components.toolbar = Ti.UI.createView(stylesheet.miniBrowser.toolbar);

			var _buttonWrapper = Ti.UI.createView(stylesheet.miniBrowser._buttonWrapper);

			_buttonWrapper.add(this.components.toolbarElements.buttonBack);
			this.components.toolbar.add(_buttonWrapper);


			_buttonWrapper = Ti.UI.createView(stylesheet.miniBrowser._buttonWrapper);

			_buttonWrapper.add(this.components.toolbarElements.buttonForward);
			this.components.toolbar.add(_buttonWrapper);


			_buttonWrapper = Ti.UI.createView(stylesheet.miniBrowser._buttonWrapper);

			_buttonWrapper.add(this.components.toolbarElements.buttonRefresh);
			this.components.toolbar.add(_buttonWrapper);


			_buttonWrapper = Ti.UI.createView(stylesheet.miniBrowser._buttonWrapper);

			_buttonWrapper.add(this.components.toolbarElements.buttonStop);
			this.components.toolbar.add(_buttonWrapper);


			// GC
			_buttonWrapper = null;


			this.components.viewProxy.add(this.components.toolbar);
		}


		// add toolbar event listener
		this.components.toolbarElements.buttonBack.addEventListener('click', _onBackClick);
		this.components.toolbarElements.buttonForward.addEventListener('click', _onForwardClick);
		this.components.toolbarElements.buttonStop.addEventListener('click', _onStopClick);
		this.components.toolbarElements.buttonRefresh.addEventListener('click', _onRefreshClick);


		/**
		 * Back button click callback
		 *
		 * @private
		 * @method _onBackClick
		 * @param {Object} event
		 * @return void
		 */
		function _onBackClick(event) {

			that.components.webView.goBack();

			return;

		} // END _onBackClick()


		/**
		 * Forward button click callback
		 *
		 * @private
		 * @method _onForwardClick
		 * @param {Object} event
		 * @return void
		 */
		function _onForwardClick(event) {

			that.components.webView.goForward();

			return;

		} // END _onForwardClick()


		/**
		 * Refresh button click callback
		 *
		 * @private
		 * @method _onRefreshClick
		 * @param {Object} event
		 * @return void
		 */
		function _onRefreshClick(event) {

			that.hasError = false;

			require('/helpers/common/tools').isAndroid ? that.components.webView.setUrl(that._reloadURL) : that.components.webView.reload();

			return;

		} // END _onRefreshClick()


		/**
		 * Stop button click callback
		 *
		 * @private
		 * @method _onStopClick
		 * @param {Object} event
		 * @return void
		 */
		function _onStopClick(event) {

			if (Tools.isIOS) {

				that.components.activityIndicator.hide();
			}

			if (Tools.isAndroid) {

				that.components.loadingBar.hide();
			}

			that.components.webView.stopLoading();

			that.components.toolbarElements.buttonBack.setEnabled(that.components.webView.canGoBack());
			that.components.toolbarElements.buttonForward.setEnabled(that.components.webView.canGoForward());

			if (that.components.toolbarElements.buttonAction) {

				that.components.toolbarElements.buttonAction.setEnabled(true);
			}

			_updateToolbarItems(false);

			return;

		} // END _onStopClick()
	}


	// add webview event listener
	this.components.webView.addEventListener('load', _onWebViewLoadStateChange);
	this.components.webView.addEventListener('beforeload', _onWebViewLoadStateChange);
	this.components.webView.addEventListener('error', _onWebViewLoadStateChange);


	/**
	 * Web view load, before load, error callbacks
	 *
	 * @private
	 * @method _onWebViewLoadStateChange
	 * @param {Object} event
	 * @return void
	 */
	function _onWebViewLoadStateChange(event) {

		if (event && event.type) {

			var isLoading =			false,
				rightNavButton = 	null;


			switch (event.type) {

				case 'beforeload':

					// show activity indicator
					rightNavButton = that.components.activityIndicator;


					if (Tools.isAndroid) {

						that.components.loadingBar.show();
					}


					var isRemoteURL = Tools.isURL(event.url);

					// save reload url
					if (isRemoteURL) {

						that._reloadURL = event.url;
					}


					if (that.components.notification.isVisible === true && isRemoteURL) {

						that.components.notification.show({

							text:       L('webViewRequestConnect'),
							color:      '#ffa500'
						});
					}

					isLoading = true;

					break;


				case 'load':
				case 'error':

					// hide loading indicator
					if (Tools.isAndroid) {

						that.components.loadingBar.hide();
					}


					// process if error given
					if (event.type === 'error' && !event.success) {

						// for Android show blank page, to hide default error message
						if (Tools.isAndroid) {

							that.components.webView.setUrl(require('/helpers/common/globals').internalPaths.error);
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
						if (isDisconnected === true) {

							notificationOptions.duration = undefined;
							notificationOptions.text = L('webViewRequestDisconnected');
						}

						that._reload = true;


						// show up error notification
						that.components.notification.show(notificationOptions);


						if (Tools.isIOS) {

							// stop loading
							that.components.webView.stopLoading();
						}
					}


					if (event.type === 'load') {

						// show up load notification
						if (that.components.notification.isVisible === true && (Tools.isIOS || !that.hasError)) {

							that.components.notification.show({

								text:		L('webViewRequestConnected'),
								color:		'#4ead54',
								duration:   1
							});
						}

						that._reload = (Tools.isAndroid ? that.hasError : false);
					}


					// change components title
					if (that.options.fetchDocumentTitle === true) {

						_updateComponentsTitle();
					}

					break;
			}


			// set window right nav button
			if (Tools.isIOS) {

				if (!that.options.customWindowObj) {

					that.components.viewProxy.setRightNavButton(rightNavButton);
				}
				else if (rightNavButton) {

					that.components.viewProxy.setRightNavButtons(that.components.initialRightNavButtons.concat(rightNavButton));
				}
				else {

					that.components.viewProxy.setRightNavButtons(that.components.initialRightNavButtons);
				}
			}


			// enable and disable buttons in toolbar
			if (that.components.toolbar) {

				_updateToolbarItems(isLoading);
			}
		}

		return;

	} // END _onWebViewLoadStateChange()


	/**
	 * Adds social share functionality if os version
	 * is equal, greater than iOS 6
	 *
	 * @private
	 * @method _addSocialShareCapabilities
	 * @param {Menu} menu - Android only
	 * @return void
	 */
	function _addSocialShareCapabilities(menu) {

		/**
		 * Shares image url through iOS social share framework
		 *
		 * @private
		 * @method _share
		 * @param {Object} event
		 * @return void
		 */
		function _share(event) {

			var url = that.components.webView.getUrl();

			require('/helpers/social/share').share({

				url:         (require('/helpers/common/tools').isURL(url) ? url : ''),
				removeIcons: 'vimeo,weibo,tencentweibo'
			});

			return;

		} // END _share()


		// create action button for toolbar
		if (Tools.isIOS) {

			that.components.toolbarElements.buttonAction = Ti.UI.createButton(stylesheet.shareButton);

			that.components.toolbarElements.buttonAction.addEventListener('click', _share);
		}
		else if (Tools.isAndroid && menu) {


			// set menu items
			menu.add(Tools.merge({

				onClick: _share

			}, stylesheet.miniBrowser.buttonShare));
		}

		return;

	} // END _addSocialShareCapabilities()


	/**
	 * If no window title is defined, set window title
	 * to webview document title and change ActionBar
	 * title
	 *
	 * @private
	 * @method _updateComponentsTitle
	 * @return void
	 */
	function _updateComponentsTitle() {

		// change window title to website document title
		var title = that.components.webView.evalJS('document.title');

		if (title && title.length) {

			var Tools = require('/helpers/common/tools');

			if (Tools.isAndroid && menu) {

				menu.getActionBar().setTitle(title);
			}
			else if (that._isWindowBased) {

				that.components.viewProxy.setTitle(title);
			}
		}

		return;

	} // END _updateComponentsTitle()


	/**
	 * Enables/disables toolbar buttons depending on
	 * the webview loading state
	 *
	 * @private
	 * @method _updateToolbarItems
	 * @return void
	 */
	function _updateToolbarItems(isLoading) {

		// isLoading something?
		if (Tools.type(isLoading) !== 'boolean') {
			isLoading = false;
		}


		// if page is not loading
		if (isLoading === false) {

			// verify if canBack or canForward
			that.components.toolbarElements.buttonBack.setEnabled(that.components.webView.canGoBack());
			that.components.toolbarElements.buttonForward.setEnabled(that.components.webView.canGoForward());

			if (Tools.isIOS) {

				// enable action button
				that.components.toolbarElements.buttonAction.setEnabled(true);

				that.components.toolbar.setItems([

					that.components.toolbarElements.buttonBack,
					that.components.toolbarElements.buttonSpace,
					that.components.toolbarElements.buttonForward,
					that.components.toolbarElements.buttonSpace,
					that.components.toolbarElements.buttonRefresh,
					that.components.toolbarElements.buttonSpace,
					that.components.toolbarElements.buttonAction
				]);
			}
			else {

				// enable action button
				menu && menu.getMenu() && menu.getMenu().findItem && menu.getMenu().findItem(stylesheet.miniBrowser.buttonShare.itemId).setEnabled(true);

				that.components.toolbarElements.buttonStop.setEnabled(false);
				that.components.toolbarElements.buttonRefresh.setEnabled(true);
			}
		}
		else if (Tools.isIOS) {

			// disable action button
			that.components.toolbarElements.buttonAction.setEnabled(false);

			that.components.toolbar.setItems([
				that.components.toolbarElements.buttonBack,
				that.components.toolbarElements.buttonSpace,
				that.components.toolbarElements.buttonForward,
				that.components.toolbarElements.buttonSpace,
				that.components.toolbarElements.buttonStop,
				that.components.toolbarElements.buttonSpace,
				that.components.toolbarElements.buttonAction
			]);
		}
		else {

			// disable action button
			menu && menu.getMenu().findItem(stylesheet.miniBrowser.buttonShare.itemId).setEnabled(false);

			that.components.toolbarElements.buttonStop.setEnabled(true);
			that.components.toolbarElements.buttonRefresh.setEnabled(false);
		}

		return;

	} // END _updateToolbarItems()


	/**
	 * Handles network change events
	 *
	 * @private
	 * @method _handleNetworkChanges
	 * @param {Object} networkChangeEvent
	 * @return void
	 */
	function _handleNetworkChanges(networkChangeEvent) {

		if (networkChangeEvent.online && that._reload === true) {

			if (!that.isInitialized) {

				_onWindowFocus.apply(that.components.viewProxy);
			}
			else {

				that.hasError = false;

				require('/helpers/common/tools').isAndroid ? that.components.webView.setUrl(that._reloadURL) : that.components.webView.reload();
			}
		}

		return;

	} // END _handleNetworkChanges()


	/**
	 * Window focus callback
	 *
	 * @private
	 * @method _onWindowFocus
	 * @param {Object} focusEvent
	 * @return void
	 */
	function _onWindowFocus(focusEvent) {

		// remove event listener
		this.removeEventListener(focusEvent.type, _onWindowFocus);


		// add web view to window
		this.add(that.components.webView);


		// set webview url to load
		that.components.webView.setUrl(that._reloadURL);


		// add network change event listener
		require('/helpers/app/EventDispatcher').on('app:networkChange', _handleNetworkChanges);


		that.isInitialized = true;


		return;

	} // END _onWindowFocus()


	// GC
	if (!Tools.isAndroid || this._isWindowBased) {

		this.components.viewProxy.addEventListener('close', function(closeEvent) {

			// remove event listener
			that.components.viewProxy.removeEventListener('open', _onWindowFocus);
			that.components.webView.removeEventListener('beforeload', _onWebViewLoadStateChange);
			that.components.webView.removeEventListener('error', _onWebViewLoadStateChange);
			that.components.webView.removeEventListener('load', _onWebViewLoadStateChange);

			require('/helpers/app/EventDispatcher').off('app:networkChange', _handleNetworkChanges);


			// clean views
			if (Tools.isIOS) {

				that.components.activityIndicator.hide();
				that.components.viewProxy.setRightNavButton(null);


				// update drawer open mode
				var Globals = require('/helpers/common/globals');

				Tools.navigateApp({

					action: Globals.action.SET_DRAWER_PROPERTY,

					propertyName:  'setOpenDrawerGestureMode',
					propertyValue: Globals.applicationDrawer.iOS.OPEN_MODE_BEZEL_PANNING_CENTERWINDOW
				});


				// GC
				Globals = null;
			}

			if (that.components.toolbar) {

				that.components.toolbar.removeAllChildren();
				that.components.viewProxy.remove(that.components.toolbar);
			}


			that.components.webView.stopLoading();
			that.components.webView.hide();


			if (Tools.isAndroid) {

				that.components.loadingBar.hide();
				that.components.viewProxy.remove(that.components.loadingBar);

				that.components.loadingBar = null;

				that.components.webView.pause();
				that.components.webView.release();
			}


			that.components.viewProxy.remove(that.components.webView);


			// release variables for GC
			that.components = null;
			that = null;

			return;
		});
	}


	return this;

} // END MiniBrowser()


/**
 * Opens the mini browser
 *
 * @public
 * @method open
 * @param {Object} openOptions
 * @return void
 */
MiniBrowser.prototype.open = function(openOptions) {

	if (!require('/helpers/common/tools').isAndroid || this._isWindowBased) {

		this.components.viewProxy.open(openOptions || {});
	}
	else {

		this.components.viewProxy.show(openOptions || {});
	}

	return;

}; // END open()


/**
 * Return underlying view object
 *
 * @public
 * @method getWindow
 * @return {Ti.UI.Window/Ti.UI.View} this.components.viewProxy
 */
MiniBrowser.prototype.getWindow = function() {

	return this.components.viewProxy;

}; // END getWindow()


// provide access to module
module.exports = MiniBrowser;
