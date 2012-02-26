$.Model("IconEntryData",
/* @Prototype */
{
	buildEntry: function( iconFile ) {
		var scale = this.resolution / this.originalImage.width;
		var canvas = this.originalImage.toCanvas(scale);
		
		$.IconEntry.createFromCanvas(canvas, iconFile);
	}
});