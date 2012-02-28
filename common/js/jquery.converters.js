/*!
 * Data type converter methods v0.1
 *
 * Copyright 2012, German Enriquez
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: 2012/02/27 21:10 -0300
 */

(function($) {
	
	var BYTE_INT_VALUE = 256;
	var DWORD_BYTE_SIZE = 4;
	
	var self = $.Converters = {
		byteArrayToInt: function( byteArray ) {
			var result = 0;
			for(var i = 0; i < byteArray.length; i++){
				result += byteArray[i] * Math.pow(BYTE_INT_VALUE, i);
			}
			
			return result;
		},
		
		intToByteArray: function( number, length ) {
			var byteArray = [];
			for(var i = 0; i<length; i++) {
				var currentByteValue = number%256;
				byteArray.push(currentByteValue);
				number = (number - currentByteValue)/256;
			}
			
			return byteArray;
		},
		
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
		},
		
		byteArrayToDWORDArray: function( byteArray ) {
			var dwordArray = [];
			byteArray = [].concat(byteArray);
			
			while(byteArray.length > 0) {
				var dwordBytes = byteArray.splice(0, DWORD_BYTE_SIZE);
				dwordArray.push(self.byteArrayToInt(dwordBytes));
			}
			
			return dwordArray;
		},
		
		enumerableToArray: function( enumerable ) {
			var array = [];
			for(var i = 0; i < enumerable.length; i++) {
				array.push(enumerable[i]);
			}
			
			return array;
		}
	};
	
}(jQuery));