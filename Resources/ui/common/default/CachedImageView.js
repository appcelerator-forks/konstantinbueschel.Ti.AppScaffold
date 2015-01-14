/*
 * CachedImageView.js
 *
 * /Resources/helpers/images/CachedImageView.js
 *
 * This module represents an image view that caches the images
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
 * CachedImageView
 *
 * @constructor
 * @param {Dictonary/Map} args
 * @return {CachedImageView} this
 */
function CachedImageView(args) {

	// load toolbox
	var Tools = require('/helpers/common/tools');


	// variable declaration
	this._options = (args || {});

	this._isHires =	Tools.isRetina;
	this._savedFile;


	// element initialization
	this.viewProxy = Ti.UI.createView({

		width: 	Ti.UI.SIZE,
		height: Ti.UI.SIZE
	});

	this.loader = Ti.UI.createActivityIndicator();
	this.imageView = Ti.UI.createImageView();

	this.viewProxy.add(this.imageView);
	this.viewProxy.add(this.loader);


	// init
	this.init(this._options);


	return this;

} // END CachedImageView()


/**
 * Initializes image view
 *
 * @public
 * @method init
 * @param {Dictonary/Map} args
 * @return void
 */
CachedImageView.prototype.init = function(args) {

	// load toolbox
	var Tools =		require('/helpers/common/tools'),
		saveFile =	true;


	// merge arguments
	args = Tools.combine(this._options, args);

	this._options = args;


	// show loader
	this.loader.show();


	if (Tools.isIOS && args.cacheHires && this._isHires) {

		args.image = args.cacheHires;
		args.hires = true;
	}

	if (!args.image || (Tools.isIOS && Tools.type(args.image) === 'string' && !Ti.Platform.canOpenURL(args.image))) {

		delete args.image;
		saveFile = false;

	}
	else if (!args.cacheNot) {

		if (!args.cacheName) {

			if (Tools.type(args.image) === 'string') {

				args.cacheName = args.image;

			}
			else if (args.image.nativePath) {

				args.cacheName = args.image.nativePath;

			}
			else {

				throw new Error('For non-file blobs you need to set a cacheName manually.');
			}
		}

		args.cacheName = Ti.Utils.md5HexDigest(args.cacheName);


		if (args.hires) {

			args.cacheName = args.cacheName + '@2x';
		}


		if (!args.cacheExtension) {

			// from http://stackoverflow.com/a/680982/292947
			var re = /(?:\.([^.]+))?$/;
			var ext = re.exec(args.image)[1];

			args.cacheExtension = (ext ? ext : '');
		}


		this._savedFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, (args.cacheName + '.' + args.cacheExtension));

		saveFile = true;


		if (this._savedFile.exists()) {

			args.image = this._savedFile;
			saveFile = false;
		}
	}


	delete args.cacheName;
	delete args.cacheExtension;
	delete args.cacheHires;


	if (saveFile === true) {

		// protect context
		var self = this;


		/**
		 * Saves image as a file to cache directory
		 *
		 * @private
		 * @method _saveImage
		 * @param {Map/Dictonary/Object} args
		 * @return void
		 */
		function _saveImage(args) {

			// remove event listener
			this.removeEventListener('load', _saveImage);


			// write file
		    self._savedFile.write(Ti.UI.createImageView({

		        image: 					this.image,
		        width: 					Ti.UI.SIZE,
		        height: 				Ti.UI.SIZE,
		        preventDefaultImage: 	true

		    }).toImage());


			// hide loader
			self.loader.hide();

			return;

		} // END _saveImage()


		this.imageView.addEventListener('load', _saveImage);
	}


	// apply image view properties - ie load image
	this.imageView.applyProperties(args);


	// set view proxy background color to image view background color
	this.viewProxy.setBackgroundColor(args.backgroundColor);


	// hide loader if iamge comes from cache
	if (!saveFile) {

		this.loader.hide();
	}


	return;

}; // END init()


/**
 * Sets new image path and updates image view
 *
 * @public
 * @method setImage
 * @param {String} imagePath
 * @return void
 */
CachedImageView.prototype.setImage = function(imagePath) {

	// reinit
	this.init({
		image: imagePath
	});

	return;

}; // END setImage()


/**
 * Gets image path
 *
 * @public
 * @method getImage
 * @param {String} imagePath
 * @return {String} nativeImagePath
 */
CachedImageView.prototype.getImage = function(imagePath) {

	var nativeImagePath =	'',
		image =				(this._savedFile ? this._savedFile : this.imageView.image);


	// load toolbox
	var Tools = require('/helpers/common/tools');

	if (imagePath && Tools.type(image) === 'string') {

		if (image.resolve) {

			nativeImagePath = image.resolve();
		}
		else if (image.nativePath) {

			nativeImagePath = image.nativePath;
		}
	}

	return nativeImagePath;

}; // END getImage()


/**
 * Apply given properties to image view
 *
 * @public
 * @method applyProperties
 * @param {Dictonary/Map} args
 * @return void
 */
CachedImageView.prototype.applyProperties = function(args) {

	// reinit
	this.init(args);

	return;

}; // END applyProperties()


/*
 * Adds event listener to image view
 *
 * @public
 * @method removeEventListener
 * @param {String} eventName
 * @param {Function} callback
 * @return {Mixed}
 */
CachedImageView.prototype.addEventListener = function(eventName, callback) {

	return this.imageView.addEventListener(eventName, callback);

}; // END addEventListener()


/**
 * Adds event listener to image view
 *
 * @public
 * @method removeEventListener
 * @param {String} eventName
 * @param {Function} callback
 * @return {Mixed}
 */
CachedImageView.prototype.removeEventListener = function(eventName, callback) {

	return this.imageView.removeEventListener(eventName, callback);

}; // END addEventListener()


/**
 * Adds event listener to image view
 *
 * @public
 * @method on
 * @param {String} eventName
 * @param {Function} callback
 * @return {Mixed}
 */
CachedImageView.prototype.on = function(eventName, callback) {

	return this.addEventListener(eventName, callback);

}; // END on()


/**
 * Remove event listener from image view
 *
 * @public
 * @method off
 * @param {String} eventName
 * @param {Function} callback
 * @return {Mixed}
 */
CachedImageView.prototype.off = function(eventName, callback) {

	return this.removeEventListener(eventName, callback);

}; // END off()


// provide public access to module
module.exports = CachedImageView;
