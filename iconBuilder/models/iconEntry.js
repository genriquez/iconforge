$.Model("IconEntryData",
/* @Prototype */
{
	buildEntry: function( iconFile, format ) {
		var scale = {width: this.resolution / this.originalImage.width, height: this.resolution / this.originalImage.height};
		var canvas = this.originalImage.toCanvas(scale);
		
		return $.IconEntry.createFromCanvas(canvas, iconFile, this.format);
	}
});