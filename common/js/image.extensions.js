/*!
 * Image canvas extension v0.1
 *
 * Copyright 2012, German Enriquez
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: 2012/02/25 22:40 -0300
 */
 
 (function($){
	HTMLImageElement.prototype.toCanvas = Image.prototype.toCanvas = function( scale ){
		scale = scale || 1;
		
		var size = {width: this.width * scale, height: this.height * scale};
		var canvas = $("<canvas />").attr(size)[0];

		canvas.getContext("2d").drawImage(this, 0, 0, size.width, size.height);
		return canvas;
	};
}(jQuery))