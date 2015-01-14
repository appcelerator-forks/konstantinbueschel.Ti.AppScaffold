/*
 * NavigationController.js
 *
 * /Resources/control/NavigationController.js
 *
 * This module controls the navigation/window stack, and the opening
 * and closing of windows in this stack
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
 * Cross platform navigation controller
 *
 * @constructor
 * @method NavigationControler
 * @param {Object} options
 * @return {NavigationController} this
 */
function NavigationController(options) {

    // variable initialization
    this.windowStack = [];


    // if options not defined, set defaults
    options = (options || {});


    // load toolbox
    var Tools = require('/helpers/common/tools');


    // merge defaults with arguments
    this.options = Tools.merge({}, options);

    return this;

} // END NavigationController()


/**
 * Opens a window and add it to stack
 *
 * @public
 * @method open
 * @param {Ti.UI.Window} windowToOpen
 * @param {Map/Dictonary} windowOpenOptions
 * @return void
 */
NavigationController.prototype.open = function(/* Ti.UI.Window */windowToOpen, windowOpenOptions) {

    // protect "this"
    var that = this;


    // load toolbox
    var Tools = require('/helpers/common/tools');


    // add window to stack
    this.windowStack.push(windowToOpen);


    // add close listener to window due to removing window
    // from stack on closing
    windowToOpen.addEventListener('close', function(windowCloseEvent) {

        // dont pop the last window, because it is the base one
        if (that.windowStack.length > 1) {

			var closedWindow = that.windowStack.pop();

			// if base window push it back to stack
			if (windowToOpen != closedWindow) {

				that.windowStack.push(closedWindow);


				// DEBUG WARNING
			Ti.API.warn('NavigationController -> onWindowClose() - Base window should not been popped from window stack. It was pushed back into window stack!');
			}


			// close dependent window?
			if (this.toClose) {

				if (that.navigationWindow) {

					that.navigationWindow.closeWindow(this.toClose, {animated: false});
				}
				else {
					this.toClose.close({animated: false});
				}
			}


	        // opening dependent window?
	        if (this.toOpen) {

				that.open(this.toOpen);
	        }
        }

        return;
    });


    // additional window event listener
    windowToOpen.addEventListener('app:navigationControllerSetToClose', function(setToCloseEvent) {

	    this.toClose = setToCloseEvent.window;
	    return;
    });

	windowToOpen.addEventListener('app:navigationControllerSetToOpen', function(setToOpenEvent) {

        this.toOpen = setToOpenEvent.window;
        return;
    });


    // Hack - Property that causes the window to opens as heavyweight (only Android OS)
	windowToOpen.navBarHidden = (Tools.type(windowToOpen.navBarHidden) === 'boolean' ? windowToOpen.navBarHidden : false);


    // on first window
    if (this.windowStack.length === 1) {

        if (Tools.isAndroid) {

        	windowToOpen.exitOnClose = (this.options.shouldFirstWindowExit === false ? false : true);
        }

        this.options.window = windowToOpen;

        this.navigationWindow = _createNavigationWindow(this.options);
		this.navigationWindow.open(windowOpenOptions || {});

    }
    // all following windows
    else {

        if (this.navigationWindow) {

			this.navigationWindow.openWindow(windowToOpen, (windowOpenOptions || {}));
        }
        else {

        	windowToOpen.open(windowOpenOptions || {});
        }
    }


    return;

}; // END open()


/**
 * Closing given window
 *
 * @public
 * @method close
 * @param {Ti.UI.Window} windowToClose
 * @return void
 */
NavigationController.prototype.close = function(windowToClose) {

    // is window to close given
    if (windowToClose) {

        // close window
        if (this.navigationWindow) {

        	this.navigationWindow.closeWindow(windowToClose);
        }
        else {
        	windowToClose.close();
        }
    }

    return;

}; // END close()


/**
 * Return to root window
 *
 * @public
 * @method home
 * @param {Ti.UI.Window} triggerWindow
 * @return void
 */
NavigationController.prototype.home = function(triggerWindow) {

    // variable initialization
    var stackLength = this.windowStack.length,
        lastItemPos = (stackLength - 1);

    // only if not the first window in stack
    if (stackLength > 1) {

        // setup chain reaction by setting up the flags on all the windows
        var i;

        for (i = lastItemPos; i > 1; i--) {

            // set dependent window
            this.windowStack[i].fireEvent('app:navigationControllerSetToClose', {

	            window: this.windowStack[i - 1]
            });
        }


        // start chain reaction by closing current window
        var lastWindowIndex = (this.windowStack.length - 1);

        if (this.navigationWindow) {

        	this.navigationWindow.closeWindow(this.windowStack[lastWindowIndex]);
        }
        else {
			this.windowStack[lastWindowIndex].close();
        }
    }

    return;

}; // END home()


/**
 * Opens new window from root window
 *
 * @public
 * @method openFromHome
 * @param {Object} windowToOpen
 * @return void
 */
NavigationController.prototype.openFromHome = function(windowToOpen) {

    // first window handling
    if (this.windowStack.length === 1) {

        // open window normally
        this.open(windowToOpen);
    }
    else {

        // delegates window opening to first window in stack
        // respectively to last window to close
        this.windowStack[1].fireEvent('app:navigationControllerSetToOpen', {

        	window: windowToOpen
        });

        this.home();
    }

    return;

}; // END openFromHome()


/**
 * Adds window given to stack. If it's the first window, for iOS it
 * creates an navigation window
 *
 * @public
 * @method add
 * @param {Ti.UI.Window} windowToAdd
 * @return void
 */
NavigationController.prototype.add = function(windowToAdd) {

	// load toolbox
	var Tools = require('/helpers/common/tools');

	if (Tools.type(windowToAdd) === 'object' && windowToAdd.apiName === 'Ti.UI.Window') {

		this.windowStack.push(windowToAdd);

		// protect context
		var that = this;


		// add close listener to window due to removing window
	    // from stack on closing
	    windowToAdd.addEventListener('close', function(windowCloseEvent) {

	        // dont pop the last window, because it is the base one
	        if (that.windowStack.length > 1) {

				var closedWindow = that.windowStack.pop();

				// if base window push it back to stack
				if (windowToAdd != closedWindow) {

					that.windowStack.push(closedWindow);


					// DEBUG WARNING
				Ti.API.warn('[NavigationController].onWindowClose():Base window should not been popped from window stack. It was pushed back into window stack!');
				}


				// close dependent window?
				if (this.toClose) {

					if (that.navigationWindow) {

						that.navigationWindow.closeWindow(this.toClose, {animated: false});
					}
					else {
						this.toClose.close({animated: false});
					}
				}


		        // opening dependent window?
		        if (this.toOpen) {
		             that.open(this.toOpen);
		        }
	        }

	        return;
	    });


	    // additional window event listener
	    windowToAdd.addEventListener('app:navigationControllerSetToClose', function(setToCloseEvent) {

		    this.toClose = setToCloseEvent.window;
		    return;
	    });

		windowToAdd.addEventListener('app:navigationControllerSetToOpen', function(setToOpenEvent) {

	        this.toOpen = setToOpenEvent.window;
	        return;
	    });


	    // Hack - Property that causes the window to opens as heavyweight (only Android OS)
		windowToAdd.navBarHidden = (Tools.type(windowToAdd.navBarHidden) === 'boolean' ? windowToAdd.navBarHidden : false);


		if (this.windowStack.length === 1) {

			if (Tools.isIOS && !this.navigationWindow) {

				this.options.window = windowToAdd;

				this.navigationWindow = _createNavigationWindow(this.options);
			}

			if (Tools.isAndroid) {
				windowToAdd.exitOnClose = true;
			}
		}
	}

	return;

}; // END add()


/**
 * Goes on step back in window hierarchy, if argument
 * given it goes n-windows back
 *
 * @public
 * @method back
 * @param {Number} stepsBack - optional
 * @return void
 */
NavigationController.prototype.back = function(stepsBack) {

    stepsBack = Number(stepsBack);

    if (!isNaN(stepsBack) && (this.windowStack.length - stepsBack) >= 1) {

        // setup chain reaction by setting up the flags on all the windows
		var lastWindowIndex =	(this.windowStack.length - 1),
			i = 				1;

		for (i; i < stepsBack; i++) {

			// set dependent window
			this.windowStack[lastWindowIndex].fireEvent('app:navigationControllerSetToClose', {

				window: this.windowStack[lastWindowIndex - 1]
			});

			lastWindowIndex--;
		}


		// start chain reaction by closing first window
		lastWindowIndex = (this.windowStack.length - 1);

		if (this.navigationWindow) {

			this.navigationWindow.closeWindow(this.windowStack[lastWindowIndex]);
		}
		else {
			this.windowStack[lastWindowIndex].close();
		}
    }
    else {

        // fetching last window index
        var lastWindowIndex = (this.windowStack.length - 1);

        if (this.navigationWindow) {

        	this.navigationWindow.closeWindow(this.windowStack[lastWindowIndex]);
        }
        else {
        	this.windowStack[lastWindowIndex].close();
        }
    }

    return;

}; // END back()


/**
 * If not previously done, creates navigation window for iOS
 *
 * @private
 * @method _createNavigationWindow
 * @param {Map/Dictonary} args
 * @return {Ti.UI.iOS.NavigationWindow}
 */
function _createNavigationWindow(args) {

	// variable declaration
	var navigationWindow = undefined;


	// load toolbox
	var Tools = require('/helpers/common/tools');


	// merge options
	var options = Tools.merge({

		modal:	false,
		window:	undefined

	}, args);


	if (Tools.type(options.window) === 'object' && options.window.apiName === 'Ti.UI.Window') {

		if (Tools.isIOS) {

			navigationWindow = Ti.UI.iOS.createNavigationWindow(options);
		}
		else {

			var NavigationWindow = require('/ui/common/android/NavigationWindow');

			navigationWindow = new NavigationWindow(options);

			NavigationWindow = null;
		}
	}


	return navigationWindow;

} // END _createNavigationWindow()


// provide public access to module
module.exports = NavigationController;
