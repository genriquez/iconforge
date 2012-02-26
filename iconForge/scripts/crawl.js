// load('iconforge/scripts/crawl.js')

load('steal/rhino/rhino.js')

steal('steal/html/crawl', function(){
  steal.html.crawl("iconforge/iconforge.html","iconforge/out")
});
