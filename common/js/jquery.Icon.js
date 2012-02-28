/*!
 * Icon (.ico) file writer and reader v0.1
 *
 * Copyright 2012, German Enriquez
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: 2012/02/25 22:40 -0300
 */
var BYTE_INT_VALUE = 256;
	
var ICON_HEADER_BYTE_COUNT = 6;
var ICON_ENTRY_BYTE_COUNT = 16;

var Helpers = {
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
		var binaryStringData = "";
		for(var byteCount = 0; byteCount < byteArray.length; byteCount++){
			binaryStringData += String.fromCharCode(byteArray[byteCount]);
		}
		
		return binaryStringData;
	}
};

(function($){	//IconFile class definition
	var IconFile = function() {
		var entries = [];
		var self = this;
		
		this.addEntry = function( entry ) {
			entries.push(entry);
			this.entryCount = entries.length;
			this.updateOffsets();	//A new entry header is added to the begining of the file
		};
		
		this.removeEntry = function( entry ) {
			entry = (isNaN(entry)? $.inArray(entry, entries) : entry);
			entries.splice(entry,1);
			this.entryCount = entries.length;
		};
		
		this.getEntries = function() {
			return [].concat(entries);
		};
		
		this.updateOffsets = function() {
			$.each(entries, function(i, entry) {
				entry.updateOffset(self);
			});
		};
	};
	
	IconFile.prototype = {
		type: null,			//Format indicator of the file (Static.Types)
		entryCount: null	//Number of icon entries found on this IconFile
	};
	
	$.IconFile = IconFile;
}(jQuery));

(function($) {	//IconEntry class definition
	var PNG_MAGIC_NUMBER_HEADER_SIZE = 8;
	var PNG_MAGIC_NUMBER_HEADER = Helpers.byteArrayToInt([137, 80, 78, 71, 13, 10, 26, 10]);

	var BMP_DEFAULT_HEADER = [66, 77, 0, 0, 0, 0, 0, 0, 0, 0, 54, 0, 0, 0];
	
	var PNG_MIME_TYPE = "image/png";
	var BMP_MIME_TYPE = "image/bmp";

	var IconEntry = function( iconFile ) {
		var imageData = null;
		
		this.getImageData = function() {
			var imageArrayData = new Uint8Array(imageData.toArrayBuffer());
			
			if( Helpers.byteArrayToInt(imageArrayData.subarray(0,PNG_MAGIC_NUMBER_HEADER_SIZE)) === PNG_MAGIC_NUMBER_HEADER) {
				var binaryStringData = imageData.toBinaryString();
				return $.BinaryData.fromBinaryString(binaryStringData, PNG_MIME_TYPE);
			} else {
				//Fix BMP headers not having properly set their height value
				imageArrayData[8] = imageArrayData[4];
				imageArrayData[9] = imageArrayData[5];
				imageArrayData[10] = imageArrayData[6];
				imageArrayData[11] = imageArrayData[7];
				
				var binaryStringData = new $.BinaryData(imageArrayData).toBinaryString();
				return $.BinaryData.fromBinaryString(Helpers.byteArrayToBinaryString(BMP_DEFAULT_HEADER) + binaryStringData, BMP_MIME_TYPE);
			}
		};
		
		/**
		 * @return {BinaryData} Binary data object with the icon data
		 */
		this.getImageBinaryData = function() {
			return imageData;
		};
		
		/**
		 * Updates the image data of the entry and the offsets of all the file
		 * @param {BinaryData} data Binary data object with the icon data
		 */
		this.setImageBinaryData = function( data ) {
			this.imageSize = (imageData = data).getSize();
			
			if(iconFile) {			
				iconFile.updateOffsets();
			}
		};
		
		/**
		 * Updates the size of the icon and corrects any special values
		 * @param {Number} size Size in pixels of the image (image must be square)
		 */
		this.setSize = function( size ) {
			size = (size === 256? 0 : size);
			this.width = this.height = size;
		}
		
		/**
		 * Updates the offset mark of the image calculating it with the other entries in the file
		 * @param {IconFile} iconFile
		 */
		this.updateOffset = function( iconFile ) {
			var entries = iconFile.getEntries();
			
			var self = this;
			this.imageOffset = ICON_HEADER_BYTE_COUNT + entries.length * ICON_ENTRY_BYTE_COUNT;
			$.each(entries, function(i, entry) {
				if( entry !== self ) {
					self.imageOffset += entry.imageSize;
					return true;
				} else {
					return false;
				}
			});
		};
	};
	
	IconEntry.prototype = {
		width: null,		//A value of 0 means max width (256)
		height: null,		//A value of 0 means max height (256)
		paletteSize: null, 	//A value of 0 means no palette is used
		colorPlanes: null,	//Should be 0 or 1
		colorDepth:  null,	//Image color depth in bpp
		imageSize: null,	//Image size in bytes
		imageOffset: null	//Offset in bytes from begining of file
	};
	
	IconEntry.createFromCanvas = function( canvas, iconFile, format ){
		var iconEntry = new $.IconEntry(iconFile);
		if( iconFile ) {
			iconFile.addEntry(iconEntry);
		}
		
		iconEntry.setSize(canvas.height);
		iconEntry.paletteSize = 0;
		iconEntry.colorPlanes = 1;
		iconEntry.colorDepth  = 32;

		var iconEntryDfr = $.Deferred();
		$(canvas).exportCanvasImage(format).load(function() {
			var imageBinaryData = $.BinaryData.fromDataURL(this.src);
			if(format == "BMP") {	//BMP files do not include headers
				imageBinaryData.splice(BMP_DEFAULT_HEADER.length);
				
				//HACK: Height of BMP entries in ICO files need to be unshifted by 1 bit (Induced from testing with prebuilt icon files)
				var heightArray = $.Converters.intToByteArray(this.height * 2, 4);
				imageBinaryData.toArrayBuffer()[8] = heightArray[0];
				imageBinaryData.toArrayBuffer()[9] = heightArray[1];
			}
			
			iconEntry.setImageBinaryData(imageBinaryData);
			iconEntryDfr.resolveWith(iconEntry, [iconEntry]);
		})
		
		return iconEntryDfr.promise();
	};
	
	$.IconEntry = IconEntry;
}(jQuery));

(function($) {	//Writer extension
	var DEFAULT_HEADER_STARTING_BYTES = [0,0];
	
	$.IconFile.prototype.buildByteArray = function() {
		var bytes = [].concat(DEFAULT_HEADER_STARTING_BYTES);
		bytes = bytes.concat(Helpers.intToByteArray(this.type, 2));
		bytes = bytes.concat(Helpers.intToByteArray(this.entryCount, 2));
		
		var imagesBytes = [];
		$.each(this.getEntries(), function(i, entry) {
			bytes = bytes.concat(entry.buildByteArray());
			imagesBytes = imagesBytes.concat(Helpers.binaryStringToByteArray(entry.getImageBinaryData().toBinaryString()));
		});

		return bytes.concat(imagesBytes);
	};
	
	$.IconEntry.prototype.buildByteArray = function() {
		var bytes = [this.width, this.height, this.paletteSize, 0 /*Reserved*/];
		bytes = bytes.concat(Helpers.intToByteArray(this.colorPlanes,2));
		bytes = bytes.concat(Helpers.intToByteArray(this.colorDepth,2));
		bytes = bytes.concat(Helpers.intToByteArray(this.imageSize,4));
		bytes = bytes.concat(Helpers.intToByteArray(this.imageOffset,4));
		
		return bytes;
	};
}(jQuery));

(function($) {	//Reader extension
	$.IconFile.fromFile = function( file ) {
		var dataArray = new Uint8Array(file.getData().toArrayBuffer());
		
		var iconFile = new $.IconFile();
		iconFile.type = Helpers.byteArrayToInt(dataArray.subarray(2, 3));
		var numberOfEntries = Helpers.byteArrayToInt(dataArray.subarray(4, 5));
		
		var remainingData = dataArray.subarray(ICON_HEADER_BYTE_COUNT);
		for(var entryCount = 0; entryCount < numberOfEntries; entryCount++) {
			var entryData = remainingData.subarray(0,ICON_ENTRY_BYTE_COUNT);
			remainingData = remainingData.subarray(ICON_ENTRY_BYTE_COUNT);

			iconFile.addEntry($.IconEntry.fromArray(iconFile, entryData, dataArray));
		}
		
		return iconFile;
	};
	
	$.IconEntry.fromArray = function( iconFile, entryData, fileData ) {
		var entry = new $.IconEntry(iconFile);
		
		entry.width  = entryData[0];
		entry.height = entryData[1];
		entry.paletteSize = entryData[2];
		entry.colorPlanes = entryData[4];
		entry.colorDepth  = entryData[6];
		entry.imageSize   = Helpers.byteArrayToInt(entryData.subarray(8,12));
		entry.imageOffset = Helpers.byteArrayToInt(entryData.subarray(12,16));
		entry.setImageBinaryData(new $.BinaryData(fileData.subarray(entry.imageOffset, entry.imageOffset + entry.imageSize)));
		
		return entry;
	};
}(jQuery));
