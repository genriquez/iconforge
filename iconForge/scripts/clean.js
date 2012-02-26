//steal/js iconforge/scripts/compress.js

load("steal/rhino/rhino.js");
steal('steal/clean',function(){
	steal.clean('iconforge/iconforge.html',{indent_size: 1, indent_char: '\t'});
});
