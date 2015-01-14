/*
 * RatingBar.js
 *
 * /Resources/ui/common/default/RatingBar.js
 *
 * This module represents a widget for star rating
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
 * RatingBar
 *
 * @constructor
 * @method RatingBar
 * @param {Map/Dictonary} args
 * return {RatingBar} this
 */
function RatingBar(args) {

	// import the stylesheet
    var Stylesheet =	require('/ui/Stylesheet'),
    	Tools =			require('/helpers/common/tools'),
		_styles =		new Stylesheet();


	// merge options
	this._options = Tools.merge({

		maxRating:     5,
		initialRating: 0,

		editable:                true,
		differentiateUserRating: false,

		callback:             undefined,
		alreadyRatedCallback: undefined

	}, args);


	// variable declaration
	this._stylesheet =		_styles.init();
	this._ratings =			[];
	this._currentRating =	this._options.initialRating;


	// create element container
	this.viewProxy = Ti.UI.createView(this._stylesheet.ratingBar.viewProxy);


	// protect context
	var _self = this;


	// create ratings
	for (var i = 0; i < this._options.maxRating; i++) {

		var rating = Ti.UI.createImageView(_self._stylesheet.ratingBar.rating);

		rating.index = (i + 1);

		_self.viewProxy.add(rating);
		_self._ratings.push(rating);


		// add event listener if editable
		if (_self._options.editable === true) {

			rating.addEventListener('click', _handleRatingClick);
		}
	}


	// set initial rating
	this.setRating(this._options.initialRating, false);


	/**
	 * Handles rating click
	 *
	 * @private
	 * @method _handleRatingClick
	 * @param {Object} clickEvent
	 * @return void
	 */
	function _handleRatingClick(clickEvent) {

		var ratingIndex = clickEvent.source.index;

		if (_self._options.editable === true) {

			_self.setRating(ratingIndex, true, _self._options.differentiateUserRating);
		}
		else {

			if (_self._options.alreadyRatedCallback && require('/helpers/common/tools').type(_self._options.alreadyRatedCallback) === 'function') {

				_self._options.alreadyRatedCallback(ratingIndex);
			}
		}

		return;

	}; // END _handleRatingClick()


	return this;

} // END RatingBar()


/**
 * Set rating
 *
 * @public
 * @method setRating
 * @param {Number} rating
 * @param {Boolean} triggerCallback - defaults true
 * @param {Boolean} differentiateUserRating - defaults false
 * @return void
 */
RatingBar.prototype.setRating = function(rating, triggerCallback, differentiateUserRating) {

	// save last rating temporarly to pass it with
	// callback
	var lastRating = this._currentRating;


	// define full image path
	var fullImagePath = (!!differentiateUserRating ? this._stylesheet.ratingBar.ratingImagePathFullFilled : this._stylesheet.ratingBar.ratingImagePathFull);


	// parse given argument
	if (rating >= 0 && rating <= this._options.maxRating) {

		// set new rating as current
		this._currentRating = rating;


		// adjust UI
		var lastSelectedRatingIndex;

		this._ratings.forEach(function(ratingObject, index) {

			if (ratingObject.index <= rating) {

				ratingObject.setImage(fullImagePath);
				lastSelectedRatingIndex = ratingObject.index;
			}
			else {

				ratingObject.setImage(this._stylesheet.ratingBar.ratingImagePathEmpty);
			}

			return;

		}, this);


		if (rating - lastSelectedRatingIndex >= 0 && rating - lastSelectedRatingIndex <= 0.3) {

			this._ratings[lastSelectedRatingIndex - 1].setImage(fullImagePath);
		}
		else if (rating - lastSelectedRatingIndex > 0.3
					&& rating - lastSelectedRatingIndex <= 0.8) {

			this._ratings[lastSelectedRatingIndex].setImage(this._stylesheet.ratingBar.ratingImagePathHalf);
		}
		else if (rating - lastSelectedRatingIndex > 0.8
					&& rating - lastSelectedRatingIndex <= 1) {

			this._ratings[lastSelectedRatingIndex].setImage(this._stylesheet.ratingBar.ratingImagePathEmpty);
		}
	}


	// execute callback
	if (this._options.callback && triggerCallback !== false) {

		this._options.callback.call(null, lastRating, this._currentRating);
	}

	return;

}; // END setRating()


/**
 * Returns current rating
 *
 * @public
 * @method getRating
 * @return {Number} rating
 */
RatingBar.prototype.getRating = function() {

	return this._currentRating;

}; // END getRating()


/**
 * Sets whether rating is editable or not
 *
 * @public
 * @method setEditable
 * @param {Boolean} editable
 * @return void
 */
RatingBar.prototype.setEditable = function(editable) {

	this._options.editable = (editable === true);

	return;

}; // END setEditable()


/**
 * Return whether rating is editable
 *
 * @public
 * @method isEditable
 * @return {Boolean} editable
 */
RatingBar.prototype.isEditable = function() {

	return this._options.editable;

}; // END isEditable()


// provide public access to module
module.exports = RatingBar;
