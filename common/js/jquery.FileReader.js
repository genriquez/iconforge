/*!
 * Binary data container class v0.1
 *
 * Copyright 2012, German Enriquez
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: 2012/02/25 22:40 -0300
 */
 (function($){
	
	var DEFAULT_DATA_URL_HEADER_TEMPLATE = "data:{mime};base64,";
	var DATA_URL_HEADER_MATCH_EXPRESSION = /^data:([^;,]*;)*[^\,]*\,/;
	var DATA_URL_MIME_TYPE_EXPRESSION = /^data\:([^\/]+\/[^\/]+)/;
	
	var Helpers = {
		binaryStringToByteArray: function( binaryStr ) {
			var byteArray = [];
			for(var charCount = 0; charCount < binaryStr.length; charCount++){
				byteArray.push(binaryStr.charCodeAt(charCount));
			}
			
			return byteArray;
		},
		
		byteArrayToBinaryString: function( byteArray ) {
			byteArray = new Uint8Array(byteArray);

			var binaryStr = "";
			for(var byteCount = 0; byteCount < byteArray.length; byteCount++){
				binaryStr += String.fromCharCode(byteArray[byteCount]);
			}
			
			return binaryStr;
		}
	};
	
	/**
	 * @class
	 * Wrapper object to handle binary data read as an ArrayBuffer
	 * @param {ArrayBuffer} dataArray ArrayBuffer of the read file
	 */
	$.BinaryData = function( dataArray, dataType ) {
		dataType = dataType || "";
		dataArray = new Uint8Array(dataArray);
		
		var self = this;
		$.extend(this, {
			
			concat: function( target ) {
				var currentSize = this.getSize();
				var dataArray = Uint8Array(currentSize + target.getSize());
				
				dataArray.set(this.toArrayBuffer(), 0);
				dataArray.set(target.toArrayBuffer(), currentSize);
				return new $.BinaryData(newDataArray.buffer, dataType);
			},
			
			/**
			 * @return {Number} Size in bytes of the data object
			 */
			getSize: function() {
				return dataArray.length;
			},
			
			/**
			 * Covnerts the data object to a Array Buffer
			 * @return {ArrayBuffer} ArrayBuffer containing the data object
			 */
			toArrayBuffer: function() {
				return dataArray;
			},
			
			/**
			 * Converts the data object into a binary string
			 * @return {String} Binary string with the encoded data
			 */
			toBinaryString: function() {
				return Helpers.byteArrayToBinaryString(dataArray);
			},
			
			/**
			 * Converts the data object into a dataURL
			 * @return {String} DataURL representation of the data object
			 */
			toDataURL: function() {
				return DEFAULT_DATA_URL_HEADER_TEMPLATE.replace("{mime}", dataType) + btoa(self.toBinaryString());
			}
		});
	};
	
	var staticMethods = {
		fromDataURL: function( dataURL ) {
			var fileType = DATA_URL_MIME_TYPE_EXPRESSION.exec(dataURL)[1] || null;
			var fileBinaryData = atob(dataURL.replace(DATA_URL_HEADER_MATCH_EXPRESSION,""));
			
			return staticMethods.fromBinaryString(fileBinaryData, fileType);
		},
		
		fromBinaryString: function( binaryStr, dataType ) {
			var fileDataArray = Helpers.binaryStringToByteArray(binaryStr);
			
			return new $.BinaryData(fileDataArray, dataType);
		}
	};
	
	$.extend($.BinaryData, staticMethods);
}(jQuery));

/*!
 * File object handler v0.1
 *
 * Copyright 2012, German Enriquez
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: 2012/02/25 22:40 -0300
 */
(function($){
	$.File = function( file ) {
		var self = this;
		var fileData = null;
		var fileLoadDeferred = $.Deferred();

		(function(){	//Load file as int binary
			var reader = new FileReader();
			reader.onload = function( event ) {
				fileData = new $.BinaryData(event.target.result, file.type);
				fileLoadDeferred.resolve(self);
			};
			reader.readAsArrayBuffer(file);
		}());
		
		$.extend(this, {
			getData: function() {
				return fileData;
			},
			
			onLoad: function( callback ) {
				fileLoadDeferred.done(callback);
			}
		});
	};
}(jQuery));