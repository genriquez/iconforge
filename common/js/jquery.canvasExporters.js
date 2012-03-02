/*!
 * Image canvas extension v0.2
 *
 * Copyright 2012, German Enriquez
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: 2012/02/25 22:40 -0300
 */
 
(function($){	//Allow exporting image elements to canvas elements
	HTMLImageElement.prototype.toCanvas = Image.prototype.toCanvas = function( scale ){
		scale = scale || 1;
		scale = {width: scale.width || scale, height: scale.height || scale};
		
		var size = {width: this.width * scale.width, height: this.height * scale.height};
		var canvas = $("<canvas />").attr(size)[0];

		canvas.getContext("2d").drawImage(this, 0, 0, size.width, size.height);
		return canvas;
	};
}(jQuery));
 
 
(function($) {	//Allow canvas elements to export to image elements
	var ExporterByFormat = {
		"PNG": function( canvas ) {	//Default native exporter
			return canvas.toDataURL();
		}
	}
	
	$.fn.exportCanvasImage = function( format ) {
		var exporter = ExporterByFormat[format];
		
		if(!exporter) {
			throw "No exporter available for format '{Format}'".replace("{Format}", format);
		} else {
			var imgElements = $();
			this.filter("canvas").each(function(i, element) {
				var img = $("<img />").attr("src", exporter(element));
				imgElements = imgElements.add(img);
			});
		
			return imgElements;
		}
	};
	
	$.exportCanvasImage = function( canvasElement, format ) {
		return $(canvasElement).exporImage(format)[0];
	};
	
	$.exportCanvasImage.converters = ExporterByFormat;
}(jQuery));

(function($) {	//Include BMP exporter format
	var BMP_FILE_HEADER = [
		/* BMP Magic Number */	66, 77,
		/* Obsolete */			0, 0, 0, 0,
		/* Reserved */			0, 0, 0, 0,
		/* PixelArray offset */	54, 0, 0, 0
	];
   
	var BMP_INFO_HEADER = [
		/* Header size */		40, 0, 0, 0,
		/* Width */ 			null, null, null, null,
		/* Height */ 			null, null, null, null,
		/* Color planes */		1, 0,
		/* Color depth */		32, 0,
		/* Compression */		0, 0, 0, 0,
		/* Pixel array size */	null, null, null, null,
		/* Horizontal DPM */	0, 0, 0, 0,
		/* Vertical DPM */		0, 0, 0, 0,
		/* Colors in Palette */	0, 0, 0, 0,
		/* Important colors */	0, 0, 0, 0
	];
	
	function convertRGBAtoBGRAimageData( imageData ) {
		var d = imageData;
		for(var i = 0; i < imageData.length; i += 4) {
			var R = d[i+0], G = d[i+1], B = d[i+2];
			d[i+0] = B; d[i+1] = G; d[i+2] = R;
		}
	};

	function arraySliceCopy( original, values, startPosition ){
		var modified = [].concat(original);
		$.each(values, function( index, value ){
			modified[index + startPosition] = value;
		});
		
		return modified;
	};
	
	$.extend($.exportCanvasImage.converters, {
		"BMP": function( canvas ) {
			var exportContext = $(canvas).clone()[0].getContext("2d");
			exportContext.scale(1,-1);
			exportContext.translate(0, -canvas.height);
			exportContext.drawImage(canvas, 0 ,0, canvas.width, canvas.height);
			
			var bmpInfoHeader = [].concat(BMP_INFO_HEADER);
			var imageData = $.Converters.enumerableToArray(exportContext.getImageData(0,0,canvas.width, canvas.height).data);
			convertRGBAtoBGRAimageData(imageData);
			
			bmpInfoHeader = arraySliceCopy(bmpInfoHeader, $.Converters.intToByteArray(canvas.width, 4), 4);
			bmpInfoHeader = arraySliceCopy(bmpInfoHeader, $.Converters.intToByteArray(canvas.height, 4), 8);
			bmpInfoHeader = arraySliceCopy(bmpInfoHeader, $.Converters.intToByteArray(imageData.length), 20);
			
			var fileData = BMP_FILE_HEADER.concat(bmpInfoHeader).concat(imageData);
			return "data:image/bmp;base64," + btoa($.Converters.byteArrayToBinaryString(fileData))
		}
	});
}(jQuery))