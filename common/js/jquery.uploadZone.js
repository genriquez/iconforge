/*!
 * jQuery.uploadZone - Upload zone plugin v0.1
 *
 * Copyright 2012, German Enriquez
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: 2012/02/25 22:40 -0300
 */
(function($) {
	var INPUT_FILE_CONTAINER_STYLE = {
		position: "relative",
		width: "20px",
		height: "20px",
		"float": "left",
		overflow: "hidden",
		opacity: 0
	};
	
	var INPUT_FILE_STYLE = {
		position: "absolute",
		top: "0",
		left: "0"
	};
	
	$.fn.uploadZone = function() {
		this.each(function() {
			var trackingZone = $(this);

			var trackingElement = $("<input type='file' multiple='multiple' />").css(INPUT_FILE_STYLE);
			trackingElement = $("<div />").append(trackingElement).appendTo(trackingZone).css(INPUT_FILE_CONTAINER_STYLE);
			function updateTrackingElementPosition( event ) {
					var offset = trackingZone.offset();
					trackingElement.css({
						top: event.pageY - offset.top - 10,
						left: event.pageX - offset.left - 10
					});
			};
			
			//Allows hovering input file over the given zone to allow clicking on any part of it to upload a file
			trackingZone.bind("mousemove", updateTrackingElementPosition);
			
			//Initializes drag-drop events to allow droping files over the uploadzone
			var zone = trackingZone[0];
			zone.addEventListener("dragover", updateTrackingElementPosition);
			
			(function() {	//Event binding for stilization
				zone.addEventListener("dragenter", function() {
					trackingZone.addClass("activeDropZone");
				});
				
				zone.addEventListener("dragleave", function() {
					trackingZone.removeClass("activeDropZone");
				});
			}());
		});
	}
	
	$.uploadZone = function(element, config) {
		$(element).uploadZone(config);
	};
}(jQuery));