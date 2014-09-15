/*
 * Animator.js
 * 
 * This module represents a helper class for animations
 * like animation sequence, parallel, fade, scale, scaleToHeight,
 * rotate and moveTo
 * 
 * Author:  Konstantin Büschel
 * Date:    2014-09-08
 * 
 * Maintenance Log
 * 
 * Author:
 * Date:
 * Changes:
 * 
 */

// private statefull (static) module varialbes
var _animator;


/**
 * Animator class
 * 
 * @constructor
 * @method Animator
 * @return {Animator} this
 */
function Animator() {
	
	return this;
	
}; // END Animator()


/**
 * Note
 * The first argument must include the animation
 * type in a field named "type". For the rest of the
 * arguments consult the desired animation
 * 
 * @public
 * @method parallel
 * @param {Array} arrayOfAnimations array of animation objects to run in parallel
 * @return void 
 */
Animator.prototype.parallel = function(arrayOfAnimations) {
	
	if (arrayOfAnimations) {
		
		arrayOfAnimations.forEach(function(animation, index) {
			
			Animator.prototype[animation.type](animation);
			
		}, this);
	}
	
	return;
	
}; // END parallel()


/**
 * Note
 * The first argument must include the animation
 * type in a field named "type". For the rest of the
 * arguments consult the desired animation
 * 
 * @public
 * @method sequence
 * @param {Array} arrayOfAnimations array of animation objects to run in sequence (one by one in queue)
 * @return void
 */
Animator.prototype.sequence = function(arrayOfAnimations) {
	
	var currentAnimation =			0,
		arrayOfAnimationsLength =	(arrayOfAnimations.length - 1),
		lastAnimation;

	runNextAnimation();
	
	function runNextAnimation() {
		
		// Call the next animation
		lastAnimation = Animator.prototype[arrayOfAnimations[currentAnimation].type](arrayOfAnimations[currentAnimation]);
		
		if (currentAnimation < arrayOfAnimationsLength) {
			lastAnimation.addEventListener('complete', onCompleteListener);
		}
		
		// Increase the current animation count
		currentAnimation = (currentAnimation + 1);
		
		return;
	}
		
	function onCompleteListener(completeEvent) {
		
		lastAnimation.removeEventListener('complete', onCompleteListener);
		runNextAnimation();
		
		return;
	}
	
	return;
	
}; // END sequence()


/**
 * Fade in animation
 * 
 * @public
 * @method fade
 * @param {Object}
 * an object with the following required variables
 *      - view the actual view you want to animate
 *      - value value of the opacity (from 0 to 1)
 *      - duration duration of the animation
 *      - onComplete a function that you want to call after the animation ends
 * 
 * @return {Ti.UI.Animation} animation
 */
Animator.prototype.fade = function(options) {
	
	// defaults
	var view =			options.view,
		value =			options.value,
		duration =		options.duration,
		onComplete =	options.onComplete;
	
	var animation = Ti.UI.createAnimation({
		 'opacity': 	value, 
		 'duration': 	duration
	});
		
	view.animate(animation);
	
	if (onComplete) {
		animation.addEventListener('complete', onCompleteListener);
	}
	
	function onCompleteListener(completeEvent){
		
		onComplete();
		animation.removeEventListener('complete', onCompleteListener);
	}
	
	// return the animation so we can do the "Sequence"
	return animation;

}; // END fade()


/**
 * Scale animation
 * 
 * @public
 * @method scaleToHeight
 * @param {Object} 
 * an object with the following required variables
 *      - view the actual view you want to animate
 *      - value value of the height
 *      - duration duration of the animation
 *      - onComplete a function that you want to call after the animation ends
 * 
 * @return {Ti.UI.Animation} animation
 */
Animator.prototype.scaleToHeight = function(options) {
    
    // defaults
    var view =			options.view,
        value =			options.value,
        duration =		options.duration,
        onComplete =	options.onComplete,
        
        animation = Ti.UI.createAnimation({
            'height':   value, 
            'duration': duration
        });
    
    // start Animation    
    view.animate(animation);
    
    if (onComplete) {
        animation.addEventListener('complete', onCompleteListener);
    }
    
    
    function onCompleteListener(_event) {
        
        onComplete(_event);
        animation.removeEventListener('complete', onCompleteListener);
    }
    
    // return the animation so we can do the "Sequence"
    return animation;
    
}; // END scaleToHeight() 


/**
 * Scale animation
 * 
 * @public 
 * @method scale
 * @param {Object} 
 * an object with the following required variables
 *      - view the actual view you want to animate
 *      - value value of the scale (from 0 to 1)
 *      - duration duration of the animation
 *      - onComplete a function that you want to call after the animation ends
 * 
 * @return {Ti.UI.Animation} animation
 */
Animator.prototype.scale = function(options) {
	
	// defaults
	var view =			options.view,
		value =			options.value,
		duration =		options.duration,
		onComplete =	options.onComplete;
	
	
	if (options.x && options.y) {
		
		var targetedValue = Ti.UI.create2DMatrix();
		targetedValue.scale(options.x, options.y);
	}
	else {
		
		var targetedValue =	Ti.UI.create2DMatrix({
			'scale': value 
		});	
	}
	
		
	var animation = Ti.UI.createAnimation({
			'transform': 	targetedValue, 
			'duration': 	duration
		});	
	
	view.animate(animation);
	
	if (onComplete) {
		animation.addEventListener('complete', onCompleteListener);
	}
	
	function onCompleteListener(completeEvent) {
		
		onComplete();
		animation.removeEventListener('complete', onCompleteListener);
	}
	
	// return the animation so we can do the "Sequence"
	return animation;
	
}; // END scale()


/**
 * Rotate animation
 * 
 * @public
 * @method rotate
 * @param {Object}
 * an object with the following required variables
 *      - view the actual view you want to animate
 *      - value value of the rotation (in degrees)
 *      - duration duration of the animation
 *      - onComplete a function that you want to call after the animation ends
 * 
 * @return {Ti.UI.Animation} animation
 */
Animator.prototype.rotate = function(options) {
	
	// defaults
	var view =			options.view,
		value =			options.value,
		duration =		options.duration,
		onComplete =	options.onComplete;
	
	var targetedValue =	Titanium.UI.create2DMatrix({
			'rotate': value 
		}),
		
		animation =		Titanium.UI.createAnimation({
			'transform': 	targetedValue, 
			'duration': 	duration
		});
	
	view.animate(animation);
	
	if (onComplete) {
		animation.addEventListener('complete', onCompleteListener);
	}
	
	function onCompleteListener(completeEvent) {
	
		onComplete();
		animation.removeEventListener('complete', onCompleteListener);
	}
	
	// return the animation so we can do the "Sequence"
	return animation;
	
}; // END rotate()


/**
 * 
 * @public
 * @method moveTo
 * @param {Object} 
 * an object with the following required variables
 *      - view the actual view you want to animate
 *      - value value of the coordinates (an object with the X and Y properties)
 *      - duration duration of the animation
 *      - onComplete a function that you want to call after the animation ends
 * 
 * @return {Ti.UI.Animation} animation
 */
Animator.prototype.moveTo = function(options) {
	
	// defaults
	var view =			options.view,
		value =			options.value,
		duration =		options.duration,
		onComplete =	options.onComplete;
	
	var targetedValue = Ti.UI.create2DMatrix();
	targetedValue = targetedValue.translate(value.x, value.y); // Looks like I can't do this one in one line
	
	var animation = Ti.UI.createAnimation({
		'transform': 	targetedValue, 
		'duration': 	duration
	});
	
	view.animate(animation);
	
	if (onComplete) {
		animation.addEventListener('complete', onCompleteListener);
	}
	
	function onCompleteListener(completeEvent){
		
		onComplete();
		animation.removeEventListener('complete', onCompleteListener);
	}
	
	// return the animation so we can do the "Sequence"
	return animation;
	
}; // END moveTo()


/**
 * Singleton get method that returns singleton animator instance
 * 
 * @public
 * @method getAnimator
 * @return {Animator} _animator
 */
exports.getAnimator = function() {
	
	if (!_animator) {
		
		_animator = new Animator(); 
	}
	
	return _animator;
	
}; // END getAnimator()
