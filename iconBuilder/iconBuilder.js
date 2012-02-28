steal('steal/less', 'jquery', 'jquery/controller', 'jquery/view', 'jquery/view/ejs', 'jquery/model')
.then('common/js/jquery.converters.js', 'common/js/jquery.canvasExporters.js', 'common/js/jquery.FileReader.js', 'common/js/jquery.Icon.js', 'common/js/jquery.uploadZone.js')
.then('./models/iconEntry.js', './style.less', './downloadIconOverlay.less', './structure.ejs', './downloadIconOverlay.ejs', './iconEntry.ejs', './newEntry.ejs').then(function(){

	var ICON_RESOLUTIONS = [256, 128, 96, 64, 48, 32 , 16];

	$.Controller("IconBuilderController",
	/* @Static */					
	{
		
	},
	/* @Prototype */
	{
		entries: null,
		
		init: function() {
			this.entries = [];
			
			this.show();
		},
		
		show: function() {
			this.element.html("iconBuilder/structure", {});
			this.element.find("div.newEntry").html("iconBuilder/newEntry", {});
		},
		
		addEntry: function( image ) {
			var closestDownscaleResolution = null;
			$.each(ICON_RESOLUTIONS, function(i, size) {
				closestDownscaleResolution = size;
				return image.width < size;
			});
			
			var entry = new IconEntryData({
				originalImage: image,
				resolution: closestDownscaleResolution,
				imageURL: image.src,
				format: "PNG"
			});
			
			this.element.find("div.entries").prepend("iconBuilder/iconEntry", {
				availableResolutions: ICON_RESOLUTIONS,
				entry: entry
			});
			
			this.entries.push(entry);
			this.updateEntryCount();
		},
		
		buildIconFile: function() {
			var icon = new $.IconFile();
			icon.type = 1;
			
			var entryDfr = $.Deferred().resolve();
			$.each(this.entries, function(i, entryData) {
				entryDfr = $.when(entryDfr, entryData.buildEntry(icon));
			});
			
			var self = this;
			var buildDfr = $.Deferred();
			entryDfr.done(function() {
				buildDfr.resolveWith(self, [icon]);
			});
			
			return buildDfr.promise();
		},
		
		updateEntryCount: function() {
			this.element.find("div.builderHeader span.entryCount").text(this.entries.length);
		},
		
		showDownloadOverlay: function( name, url ) {
			this.element.find("div.overlay").remove();
			this.element.append("iconBuilder/downloadIconOverlay", {
				name: name,
				url: url
			});
			
			var overlay = this.element.find("div.overlay").delegate("a", "click", function() {
				overlay.remove();
			});
		},
		
		"div.iconEntry select[name=resolution] change": function( element ) {
			var resolution = element.val();
			
			var container = element.closest("div.iconEntry");
			container.model().resolution = resolution;
			container.find("div.preview > img").attr({
				width: resolution,
				height: resolution
			});
		},

		"div.iconEntry select[name=format] change": function( element ) {
			var format = element.val();
			element.closest("div.iconEntry").model().format = format;
		},
		
		"div.newEntry input:file change": function( element, event ) {
			var self = this;
			
			$.each(event.target.files, function(i, file) {
				(new $.File(file)).onLoad(function( fileObj ) {
					var image = new Image();
					image.onload = function() {
						self.addEntry(image);
					}
					
					image.src  = fileObj.getData().toDataURL();
				});
			});
			
			this.element.find("div.newEntry").html("iconBuilder/newEntry", {});
		},

		"div.builderHeader a.forgeIcon click": function( element ) {
			this.showDownloadOverlay();
			this.buildIconFile().done(function( icon ) {
				var iconDataURL = new $.BinaryData(icon.buildByteArray(), "application/octet-stream").toDataURL();
				var fileName = this.element.find("div.builderHeader input:text").val() || "noname.ico";
				
				this.showDownloadOverlay(fileName, iconDataURL);
			});
			
			return false;
		},
		
		"div.iconEntry a.removeEntry click": function( element ) {
			var container = element.closest("div.iconEntry").remove();
			this.entries.splice($.inArray(container.model(), this.entries),1);
			this.updateEntryCount();
		}
	});
});