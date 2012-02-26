//steal/js iconforge/scripts/compress.js

load("steal/rhino/rhino.js");
steal('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('iconforge/scripts/build.html',{to: 'iconforge'});
});
