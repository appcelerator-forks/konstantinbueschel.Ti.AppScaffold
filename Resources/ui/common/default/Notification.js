/*
 * Notification.js
 *
 * /Resources/ui/common/default/Notification.js
 *
 * This is a module that creates an notification like Facebook Messenger
 * network connection message.
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
 * Notification
 *
 * @constructor
 * @method WebViewNotification
 * @param {Map/Dictonary} args
 * @return {WebViewNotification} this
 */
function Notification(args) {

	// import the stylesheet
	var Stylesheet =	require('/ui/Stylesheet'),

	    _styles =		new Stylesheet(),
	    _stylesheet =	_styles.init();

	_styles =		null;
	Stylesheet =	null;


	// variable initialization
	this.isVisible = false;
	this._isInitialized = false;
	this._topValueForHiding;
	this._initTopValue;


	// merge args
	var options = (args || {});


	// protect context
	var _self = this;


	/**
	 * Postlayout callback
	 *
	 * @private
	 * @method _afterMessageLayout
	 * @param {Object} afterLayoutEvent
	 * @return void
	 */
	var _afterMessageLayout = function(afterLayoutEvent) {

		var negativeHeight = (this.getRect().height * -1),
		    setNewTopValue = (Math.abs(negativeHeight) > Math.abs(_self._initTopValue));


		if (!_self._isInitialized) {

			if (setNewTopValue) {

				this.setTop(negativeHeight);
			}

			_self._isInitialized = true;
		}

		if (setNewTopValue) {

			_self._topValueForHiding = negativeHeight;
		}


		return;

	}; // END _afterMessageLayout()


	// create element container
	this.viewProxy = Ti.UI.createView(_stylesheet.notification.viewProxy);

	this._initTopValue = this.viewProxy.getTop();
	this._topValueForHiding = this._initTopValue;

	this.viewProxy.addEventListener('postlayout', _afterMessageLayout);


	// create message
	this._notificationMessage = Ti.UI.createLabel(_stylesheet.notification._notificationMessage);

	this.viewProxy.add(this._notificationMessage);


	// add element container to parent view
	// if parent view is given
	if (options.parent) {

		options.parent.add(this.viewProxy);
	}


	return this;

} // END Notification()


/**
 * Shows up notification
 *
 * @public
 * @method show
 * @param {Map/Dictonary} args
 * @return void
 */
Notification.prototype.show = function(args) {

	// protect context
	var self = this;


	// update notification UI
	if (args.color) {

		this.viewProxy.setBackgroundColor(args.color);
	}

	if (args.text) {

		this._notificationMessage.setText(args.text);
	}


	// if notification already shows up
	// update UI, if duration is given than
	// hide it after delay = duration
	if (this.isVisible === true && args.duration) {

		setTimeout(function() {

			self.hide({

				callback: function() {

					if (args.callback) {

						args.callback();
					}
				}
			});

		}, (args.duration * 1000));
	}
	else {

		this.isVisible = true;

		this.viewProxy.animate({

			top:      0,
			duration: 200,
			delay:    (args.delay || 0)

		}, function() {

			if (args.duration) {

				setTimeout(function() {

					self.hide({callback: args.callback});

				}, (parseInt(args.duration) * 1000));
			}
			else if (args.callback) {

				args.callback();
			}
		});
	}

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
Notification.prototype.hide = function(args) {

	// protect context
	var self = this;


	// merge arguments
	args = require('/helpers/common/tools').merge({

		delay:      0,
		duration:   200

	}, args);

	args.top = this._topValueForHiding;


	// hide notification
	if (this.isVisible === true) {

		this.isVisible = false;

		if (this.viewProxy) {

			this.viewProxy.animate({

				delay:    args.delay,
				duration: args.duration,
				top:      args.top

			}, function() {

				if (args && args.callback) {

					args.callback();
				}
			});
		}
	}

	return;

}; // END hide()


// provide public access to module
module.exports = Notification;
