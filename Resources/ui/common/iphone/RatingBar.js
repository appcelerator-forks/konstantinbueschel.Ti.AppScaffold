/*
 * RatingBar.js
 * 
 * /Resources/ui/common/iphone/RatingBar.js
 * 
 * This module represents a widget for star rating
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
		
		maxRating:		5,
		initialRating:	0,
		editable:		true,
		callback:		undefined
		
	}, args);
	
	
	// variable declaration
	this._stylesheet =		_styles.init();
	this._ratings =			[];
	this._currentRating =	this._options.initialRating;
	
	
	// create element container
	this.viewProxy = Ti.UI.createView(this._stylesheet.ratingBar.viewProxy);
	
	
	// protect context
	var self = this;
	
	
	// create ratings
	for (var i = 0; i < this._options.maxRating; i++) {
		
		var rating = Ti.UI.createImageView(self._stylesheet.ratingBar.rating);
		
		rating.index = (i + 1);
		
		self.viewProxy.add(rating);
		self._ratings.push(rating);
		
		
		// add event listener if editable
		if (self._options.editable === true) {
			
			rating.addEventListener('click', _handleRatingClick);	
		}
	}
	
	
	// set initial rating
	this.setRating(this._options.initalRating);
	
	
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
		
		if (self._options.editable === true) {
			
			self.setRating(ratingIndex);
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
 * @return void
 */
RatingBar.prototype.setRating = function(rating) {
	
	// save last rating temporarly to pass it with
	// callback
	var lastRating = this._currentRating;
	
	
	// parse given argument
	if (rating >= 0 && rating <= this._options.maxRating) {
		
		// set new rating as current		
		this._currentRating = rating;
		
		
		// adjust UI
		var lastSelectedRatingIndex;
		
		this._ratings.forEach(function(ratingObject, index) {
			
			if (ratingObject.index <= rating) {
				
				ratingObject.setImage(this._stylesheet.ratingBar.ratingImagePathFull);
				lastSelectedRatingIndex = ratingObject.index;
			}
			else {
				
				ratingObject.setImage(this._stylesheet.ratingBar.ratingImagePathEmpty);
			}
			
			return;
			
		}, this);
		
		
		if (rating - lastSelectedRatingIndex >= 0 && rating - lastSelectedRatingIndex <= 0.3) {

			this._ratings[lastSelectedRatingIndex - 1].setImage(this._stylesheet.ratingBar.ratingImagePathFull);
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
	if (this._options.callback) {
		
		this._options.callback(lastRating, this._currentRating);		
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
