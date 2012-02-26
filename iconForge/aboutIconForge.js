steal("jquery/view", "jquery/view/ejs").then("//iconForge/about.ejs").then(function() {
	$.Controller("AboutController", {
		init: function() {
			this.element.html($.View("//iconForge/about.ejs", {}));
		}
	});
});