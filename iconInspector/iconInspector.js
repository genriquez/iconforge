steal('steal/less', 'jquery', 'jquery/controller', 'jquery/view', 'jquery/view/ejs')
.then('common/js/image.extensions.js', 'common/js/jquery.FileReader.js', 'common/js/jquery.Icon.js', 'common/js/jquery.uploadZone.js')
.then('./style.less', './structure.ejs', './icon.ejs', function(){

	$.Controller("IconInspectorController",
	/* @Static */					
	{
		
	},
	/* @Prototype */
	{
		init: function() {
			this.show();
		},
		
		show: function() {
			this.element.html("iconInspector/structure", {});
		},
		
		showIconData: function( iconFile ) {
			this.element.find("div.iconData").html("iconInspector/icon", {
				entries: iconFile.getEntries()
			});
		},
		
		"input:file change": function( element, event ) {
			var file = event.target.files[0];
			
			var self = this;
			(new $.File(file)).onLoad(function( fileObj ) {
				var iconFile = $.IconFile.fromFile(fileObj);
				self.showIconData(iconFile);
			});
		}
	});
	
});