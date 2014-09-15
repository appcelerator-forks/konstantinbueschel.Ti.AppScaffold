/*
 * WebView.js
 * 
 * /Resources/ui/common/default/WebView.js
 * 
 * This is a module that helps to create an internal browser view
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
 * WebViewNotification
 * 
 * @constructor
 * @method WebViewNotification
 * @param {Map/Dictonary} args
 * @return {WebViewNotification} this
 */
function WebViewNotification(args) {
	
	// import the stylesheet
    var Stylesheet =	require('/ui/Stylesheet'),
		
		_styles =		new Stylesheet(),
		_stylesheet =	_styles.init();
	
	_styles =		null;
	Stylesheet =	null;
		
	
	// variable initialization
	this.isVisible = false;
	
	
	// merge args
	var options = (args || {});
	
	
	// create element container
	this.viewProxy = Ti.UI.createView(_stylesheet.webViewNotification.viewProxy);
	
	
	// create separator
	this._separator = Ti.UI.createView(_stylesheet.webViewNotification._separator);
	
	this.viewProxy.add(this._separator);
	
	
	// create message
	this._notificationMessage = Ti.UI.createLabel(_stylesheet.webViewNotification._notificationMessage);
	
	this.viewProxy.add(this._notificationMessage);
	
	
	// add element container to parent view
	// if parent view is given
	if (options.parent) {
		
		options.parent.add(this.viewProxy);
	}
	
	return this;
	
} // END WebViewNotification()


/**
 * Shows up notification
 * 
 * @public
 * @method show
 * @param {Map/Dictonary} args
 * @return void
 */
WebViewNotification.prototype.show = function(args) {
	
	// protect context
	var self = this;
	
	var animationSequence = [];
	
	if (this.isVisible === true) {
		
		animationSequence.push({
			
			type:		'scale',
			view:		this.viewProxy,
			value:		0,
			duration:	200,
			
			onComplete: function() {
				
				self.isVisible = false;
			}
		});
	}
	
	animationSequence.push({
		
		type:		'scale',
		view:		this.viewProxy,
		value:		1,
		duration:	400,
		
		onComplete: function() {
			
			self.isVisible = true;
			
			if (args.duration) {
				
				setTimeout(function() {
					
					self.hide({callback: args.callback});
					
				}, (parseInt(args.duration) * 1000));
			}
			else if (args.callback) {
				
				args.callback();
			}
		}
	});
	
	
	// update notification UI
	if (args.color) {
		
		this.viewProxy.setBackgroundColor(args.color);
	}
	
	if (args.text) {
		
		this._notificationMessage.setText(args.text);
	}
	
	
	// start animation sequence
	Animator.sequence(animationSequence);
	
	return;
	
}; // END show()


/**
 * Hides notification if it is visible
 * 
 * @public
 * @method hide
 * @param {Map/Dictonary} args
 * @return void
 */
WebViewNotification.prototype.hide = function(args) {
	
	// protect context
	var self = this;	
		
	if (this.isVisible === true) {
		
		// Animator.scaleToHeight({
		Animator.scale({
			
			view:		this.viewProxy,
			value:		0,
			duration:	200,
			
			onComplete:	function() {
				
				self.isVisible = false;
				
				if (args && args.callback) {
					
					args.callback();
				}
			}
		});
	}
	
	
	// memory management
	_stylesheet = null;
	
	return;
	
}; // END hide()




// private statefull (static) module vars
var Animator = require('/helpers/animation/Animator').getAnimator();


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
		
		initOnCreation:	true
		
	}, args);
	
	
	// varialbe declaration
	this.url = this._options.url;
	delete this._options.url;
	
	this.initOnCreation = (this._options.initOnCreation === true);
	delete this._options.initOnCreation;
	
	this.isInizialized =	false;
	this._reload =			false;
	
	
	// protect context
	var that = this;
	
	
	// create element container
	this.viewProxy = Ti.UI.createView(_stylesheet.webView.viewProxy);
	
	
	// Android: add element container event listener for
	// Android cause the Android drawer module fires postlayout event
	if (Tools.isAndroid && this.initOnCreation === true) {
		
		this.viewProxy.addEventListener('postlayout', _onFocus);
	}
	
	
	// iOS: add iOS ViewPager event callbacks
	if (Tools.isIOS) {
	
		this.viewProxy.addEventListener('viewPagerActive', function(args) {
			
			that.init();
			
			return;
		});
	}
	
	
	// create notification view
	this._notification = new WebViewNotification({
		
		parent:	this.viewProxy
	});
	
	
	// Android: create loading view
	if (Tools.isAndroid) {
		
		this._loadingBarContainer = Ti.UI.createView(stylesheet.webView._loadingBarContainer);
		
		this.viewProxy.add(this._loadingBarContainer);
		
		var TiSmoothProgressBar = require('com.artanisdesign.tismoothprogressbar');
	
		this._loadingBar = TiSmoothProgressBar.createSmoothProgressBar(stylesheet.webView._loadingBar);
		
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
		
		if (event && event.type) {
			
			var isLoading = false; 
			
			switch (event.type) {
				
				case 'beforeload':
					
					// show activity indicator
					if (Tools.isAndroid) {
						
						that._loadingBarContainer.add(that._loadingBar);
					}

					isLoading = true;
				
					break;
				
				
				case 'load':
				case 'error':
					
					var action = require('/helpers/common/globals').global.action,
						notificationOptions;
					
					
					// hide loading indicator
					if (Tools.isAndroid) {
						
						that._loadingBarContainer.remove(that._loadingBar);
					}
					
					
					// process if error given
					if (event.type === 'error') {
						
						// define error notification
						if (Tools.hasNetworkConnectivity()) {
							
							that._notification.show({
								
								text:		(event.message || L('webViewDefaultLoadErrorMessage')),
								color:		'#ff0000'
							});
							
							that._webView.stopLoading();
							
						}
						// define offline connection notification
						else {
							
							that._notification.show({
								
								text:		L('networkChangeDisconnected'),
								color:		'#ff0000'
							});
							
							that._reload = true;
						}
					}
					
					
					// hide notification
					if (event.type === 'load') {
						
						that._notification.hide();
						that._reload = false;
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
					
					
					if (that._reload === true) {
						
						that._webView.reload();
					}
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

		
		// set webview url to load
		if (!that.isInizialized && that.initOnCreation === true) {
			
			that._webView.setUrl(that.url);
			that.isInizialized = true;
		}		
		
		
		// add network change event listener
		Ti.App.addEventListener('app:networkChange', _handleNetworkChanges);
		
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
		this._webView.setUrl(this.url);
		
		// update init state
		this.isInizialized = true;
	}
	
	
	if (this._reload === true) {
		
		this._notification.hide();
		this._webView.reload();
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
	
	
	// remove event listener
	this._webView.removeEventListener('beforeload', _onWebViewLoadStateChange);
	this._webView.removeEventListener('error', _onWebViewLoadStateChange);
	this._webView.removeEventListener('load', _onWebViewLoadStateChange);
	
	Ti.App.removeEventListener('app:networkChange', _handleNetworkChanges);
	
	
	// clean views	
	this._webView.stopLoading();
	this._webView.hide();
	
	
	if (Tools.isAndroid) {
		
		this._loadingBarContainer.remove(this._loadingBar);
					
		this._webView.pause();
		this._webView.release();	
	}
	
	this.viewProxy.remove(this._notification.viewProxy);
	this.viewProxy.remove(this._webView);
	
	
	// release variables for GC
	this._notification =	null;
	this._webView =			null;
	Tools =					null;
	
	
	return;
	
}; // END destroy()


// provide public access to module
module.exports = WebView;
