/*
 * MiniBrowser.js
 * 
 * /Resources/ui/windows/default/MiniBrowser.js
 * 
 * This is a module that helps to create an internal browser window
 * in the application.
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
	
	// include requirements
	var Tools = require('/helpers/common/tools');
	
	
	// import the stylesheet
    var Stylesheet =	require('/ui/Stylesheet'),
		Tools =			require('/helpers/common/tools'),
		
		styles =		new Stylesheet(),
		stylesheet =	styles.init();
	
	
	// merge params
	this.options = Tools.merge({
		
		window:				stylesheet.miniBrowser.window,
		webView:			stylesheet.miniBrowser.webView,
		
		showToolbar:		true,
		fetchDocumentTitle:	true,
		replaceBackButton:	false,
		
		customWindowObj:	undefined
		
	}, options);
	
	
	// variable initialization
	this.components =	{};
	this.url =			this.options.webView.url;
	
	delete this.options.webView.url;
	
	this.components.initialRightNavButtons = [];
	

	// protect "this"
	var that = this;
	
	
	// create window
	if (Tools.isIOS) {
		
		// create activity indicator
		this.components.activityIndicator = Ti.UI.createActivityIndicator(stylesheet.miniBrowser.activityIndicator);
		this.components.activityIndicator.show();
		
		
		// create window
		if (this.options.customWindowObj) {
			
			this.components.window = this.options.customWindowObj;
			
			this.components.initialRightNavButtons = this.components.window.getRightNavButtons();
			
			this.components.window.setRightNavButtons(this.components.initialRightNavButtons.concat(this.components.activityIndicator));
		}
		else {
			
			this.components.window = Ti.UI.createWindow(Tools.merge({
				
				rightNavButton: this.components.activityIndicator
				
			}, this.options.window));	
		}
	}
	else if (Tools.isAndroid) {
		
		// create window
		this.components.window = Ti.UI.createWindow(this.options.window);
		
		
		// setup ActionBar and menu
		var Menu =	require('/helpers/app/menu'),
			menu =	new Menu(this.components.window);
			
		
		// set ActionBar home icon click callback
		menu.actionBar.on('homeIconItemSelected', function() {
			
			that.components.window.close();
		    
		    return;
		});
			
					
		// create loading
		this.components.loadingBarContainer = Ti.UI.createView(stylesheet.miniBrowser.loadingBarContainer);
		
		this.components.window.add(this.components.loadingBarContainer);
		
		var TiSmoothProgressBar = require('com.artanisdesign.tismoothprogressbar');
	
		this.components.loadingBar = TiSmoothProgressBar.createSmoothProgressBar(stylesheet.miniBrowser.loadingBar);
		
		TiSmoothProgressBar = null;
	}	
	
	
	// create close button if window is modal
	if (this.options.window.modal === true) {

		// create close button
		this.components.closeButton = Ti.UI.createButton({
			
			title: L('miniBrowserButtonCloseTitle')
		});
		
		// set as window left nav button
		if (Tools.isIOS) {
			
			this.components.window.setLeftNavButton(this.components.closeButton);	
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
			
			that.components.window.close();
			
			return;
			
		} // END _onCloseButtonClick()
		
	}
	else if (Tools.isIOS && this.options.replaceBackButton === true) {
		
		// back button replacement
	    this.components.backButton = Ti.UI.createButton(stylesheet.backNavBarButton);
	    
	    this.components.window.setLeftNavButton(this.components.backButton);
	    
	    this.components.backButton.addEventListener('click', function(clickEvent) {
			
			// navigate back
			var globals = require('/helpers/common/globals').global;
			
			Tools.navigateApp({
				action: globals.action.NAVIGATE_BACK
			});
	    });
	}
	
	
	// add window event listener
	this.components.window.addEventListener('open', _onWindowFocus);
		
		
	// create web view
	this.components.webView = Ti.UI.createWebView(Tools.merge({
		
		bottom:					(this.options.showToolbar === true ? 44 : 0),
		disableBounce:			true,
		softKeyboardOnFocus:	(Tools.isIOS ? '' : Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS)
		
	}, options.webView));
	
	
	// create toolbar components
	if (this.options.showToolbar === true) {
		
		// holds all toolbar elements
		this.components.toolbarElements = {};
				
				
		// create social share button
		_addSocialShareCapabilities();
		
		
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
			this.components.window.add(this.components.toolbar);			
		}
		else {
			
			this.components.toolbar = Ti.UI.createView({
				
				width:				Ti.UI.FILL,
				height:				44,
								
				layout:				'horizontal',
				backgroundColor:	'transparent'
			});
			
			this.components.toolbar.add(this.components.toolbarElements.buttonBack);
			this.components.toolbar.add(this.components.toolbarElements.buttonForward);
			this.components.toolbar.add(this.components.toolbarElements.buttonRefresh);
			this.components.toolbar.add(this.components.toolbarElements.buttonAction);
			
			this.components.window.add(this.components.toolbar);
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
			
			that.components.webView.reload();
			
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
			
			that.components.activityIndicator.hide();
			
			if (Tools.isAndroid) {
				
				that.components.loadingBarContainer.remove(that.components.loadingBar);
			}
			
			that.components.webView.stopLoading();
			
			that.components.toolbarElements.buttonBack.setEnabled(that.components.webView.canGoBack());
			that.components.toolbarElements.buttonForward.setEnabled(that.components.webView.canGoForward());
			
			that.components.toolbarElements.buttonAction.setEnabled(true);
			
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
						
						that.components.loadingBarContainer.add(that.components.loadingBar);
					}

					isLoading = true;
				
					break;
				
				
				case 'load':
				case 'error':
				
					// hide loading indicator
					if (Tools.isAndroid) {
						
						that.components.loadingBarContainer.remove(that.components.loadingBar);
					}
					
					
					// process if error given
					if (event.type === 'error' && !event.success) {
						
						var action = require('/helpers/common/globals').global.action,
							notificationOptions;
						
						
						// define error notification
						if (Tools.hasNetworkConnectivity()) {
							
							notificationOptions = {
								
								action:			action.HANDLE_NOTIFICATION,
								
								message:		(event.message || L('miniBrowserDefaultLoadErrorMessage')),
								duration:		2,
								color:			'#ff0000'	
							};
						}
						// define offline connection notification
						else {
							
							notificationOptions = {
								
								action:		action.HANDLE_NOTIFICATION,
								
								message:	L('networkChangeDisconnected'),
								duration:	2,
								color:		'#ff0000'
							};
						}
						
						
						// process showing up notification
						if (notificationOptions) {
							
							Tools.navigateApp(notificationOptions);
						}
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
					
					that.components.window.setRightNavButton(rightNavButton);
				}
				else if (rightNavButton) {
					
					that.components.window.setRightNavButtons(that.components.initialRightNavButtons.concat(rightNavButton));
				}
				else {
					
					that.components.window.setRightNavButtons(that.components.initialRightNavButtons);
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
	 * @return void
	 */
	function _addSocialShareCapabilities() {
		
		// create action button for toolbar
		that.components.toolbarElements.buttonAction = Ti.UI.createButton(stylesheet.shareButton);

	    that.components.toolbarElements.buttonAction.addEventListener('click', _share);

	    
		/**
		 * Shares image url through iOS social share framework
		 * 
		 * @private
		 * @method _share
		 * @param {Object} event
		 * @return void
		 */
		function _share(event) {
			
			var Social = require('/helpers/social/share');
			
			Social.share({
				
				url:			that.components.webView.getUrl(),	
				removeIcons:	'vimeo,weibo,tencentweibo'
				
			}, function(shareEvent) {
				
				// DEBUG 
				Ti.API.debug('[MiniBrowser]._share():callback():shareEvent = ' + JSON.stringify(shareEvent));
				
				return;
			});
			
			return;
			
		} // END _share()
		
		return;
		
	} // END _addSocialShareCapabilities()
		
	
	/**
	 * If no window title is defined, set window title 
	 * to webview document title and change action dialog
	 * title
	 * 
	 * @private
	 * @method _updateComponentsTitle
	 * @return void
	 */
	function _updateComponentsTitle() {
		
		// change window title to website document title
		that.components.window.setTitle(that.components.webView.evalJS('document.title'));
		
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
			that.components.toolbarElements.buttonAction.setEnabled(true);
	
			if (Tools.isIOS) {
				
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
				
				that.components.toolbar.removeAllChildren();
				
				that.components.toolbar.add(that.components.toolbarElements.buttonBack);
				that.components.toolbar.add(that.components.toolbarElements.buttonForward);
				that.components.toolbar.add(that.components.toolbarElements.buttonRefresh);
				that.components.toolbar.add(that.components.toolbarElements.buttonAction);
			}
		} 
		else {
			
			// disable action button
			that.components.toolbarElements.buttonAction.setEnabled(false);
			
			if (Tools.isIOS) {
				
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
				
				that.components.toolbar.removeAllChildren();
				
				that.components.toolbar.add(that.components.toolbarElements.buttonBack);
				that.components.toolbar.add(that.components.toolbarElements.buttonForward);
				that.components.toolbar.add(that.components.toolbarElements.buttonStop);
				that.components.toolbar.add(that.components.toolbarElements.buttonAction);
			}
			
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
		
		var action = require('/helpers/common/globals').global.action,
			
			navigateOptions;
			
		
		// show notification
		switch (networkChangeEvent.networkType) {
			
			case Ti.Network.NETWORK_NONE:
				
				if (!networkChangeEvent.online) {
					
					// define permanent notification
					navigateOptions = {
						
						action:		action.HANDLE_NOTIFICATION,
						
						message:	L('networkChangeDisconnected'),
						color:		'#00ff00',
						duration:	2
					};					
				}
				
				break;
				
				
			default:
				
				if (networkChangeEvent.online) {
					
					// define short-live notification
					navigateOptions = {
						
						action:		action.HANDLE_NOTIFICATION,
						
						message:	L('networkChangeConnected'),
						color:		'#00ff00',
						duration:	2
					};
				}
				
				break;
		}
		
		
		// process showing up notification
		if (navigateOptions) {
			
			Tools.navigateApp(navigateOptions);
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
		this.removeEventListener('open', _onWindowFocus);

		
		// add web view to window	
		this.add(that.components.webView);
		
		
		// set webview url to load		
		that.components.webView.setUrl(that.url);
		
		
		// add network change event listener
		Ti.App.addEventListener('app:networkChange', _handleNetworkChanges);
		
		return;
		
	} // END _onWindowFocus()
	
	
	// memory management
	this.components.window.addEventListener('close', function(closeEvent) {
		
		// remove event listener
		that.components.window.removeEventListener('focus', _onWindowFocus);
		
		that.components.webView.removeEventListener('beforeload', _onWebViewLoadStateChange);
		that.components.webView.removeEventListener('error', _onWebViewLoadStateChange);
		that.components.webView.removeEventListener('load', _onWebViewLoadStateChange);
		
		Ti.App.removeEventListener('app:networkChange', _handleNetworkChanges);
		
		
		// clean views
		if (Tools.isIOS) {
			
			that.components.activityIndicator.hide();
			that.components.window.setRightNavButton(null);
		}
		
		if (that.components.toolbar) {
			
			that.components.toolbar.removeAllChildren();
			that.components.window.remove(that.components.toolbar);
		}	
		
		
		that.components.webView.stopLoading();
		that.components.webView.hide();
		
		
		if (Tools.isAndroid) {
			
			that.components.loadingBarContainer.remove(that.components.loadingBar);
						
			that.components.webView.pause();
			that.components.webView.release();	
		}
		
		
		that.components.window.remove(that.components.webView);
		
		
		// release variables for GC
		that.components = null;
		that = null;
		
		return;
	});
	

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
	
	this.components.window.open(openOptions || {});
	
	return;
	
}; // END open()


/**
 * Return underlying window object
 * 
 * @public
 * @method getWindow
 * @return {Ti.UI.Window} this.components.window
 */
MiniBrowser.prototype.getWindow = function() {
	
	return this.components.window;
	
}; // END getWindow()


// provide access to module
module.exports = MiniBrowser;
