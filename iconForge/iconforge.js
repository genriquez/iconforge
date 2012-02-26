steal('steal/less', 'jquery', 'jquery/controller')
.then('./layout.less', './theme.less', 'iconInspector', 'iconBuilder', './aboutIconForge.js')
.then(function(){
	
	var SectionControllersByName = {
		"inspector": IconInspectorController,
		"builder": IconBuilderController,
		"about": AboutController
	};
	
	$.Controller('IconForgeController',
	/* @Static */					
	{
		
	},
	
	/* @Prototype */	
	{
		
		init: function() {
			this.changePageSection("about");
		},
		
		changePageSection: function( sectionName ) {
			var ControllerClass = SectionControllersByName[sectionName];
			if( ControllerClass ) {
				var pageContent = this.element.find("div.content");
				pageContent.children().remove();

				var controllerContainer = $("<div />").appendTo(pageContent);
				new ControllerClass(controllerContainer);
			}
		},
		
		"nav a click": function( element ) {
			this.element.find("nav a").removeClass("selected");
			element.addClass("selected");
			
			this.changePageSection(element.attr("data-section-name"));
		}
	});
}).then(function(){
	$(document).ready(function(){
		new IconForgeController(this);
	});
});