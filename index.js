'use strict';

const fs = require('hexo-fs');
const path = require('path');
const cheerio = require('cheerio');
const marked = require('marked');
const stripIndent = require('strip-indent');

// copy style file into public folder
const baseDir = hexo.base_dir;
const styleFile = 'accordionlistbox.css';
const styleUri = path.resolve(__dirname, styleFile);
fs.copyFile(styleUri, path.resolve(baseDir, hexo.config.public_dir, 'css', styleFile));

// insert the style file before the post content
hexo.extend.filter.register('before_post_render', function(data) {
  if ((/{%\s*accordionlist/).test(data.content)) {
    const styleLink = `{% raw %}<link rel="stylesheet" href="${hexo.config.root}css/${styleFile}" />{% endraw %}`;
    data.content = styleLink + data.content;
    return data;
  }
});

// register the accordionlist tag
hexo.extend.tag.register('accordionlist', function(args, content) {
  const _wrapName = `wrap-${Math.random().toString(32).substr(2, 4)}`;
  const $ = cheerio.load(`<div class="${_wrapName}">${content}</div>`, { decodeEntities: false });;
  const $content = $(`.${_wrapName}`);
  // console.info($content);
  const $ll = $content.find('ll');
  // console.info($ll[0].attribs.title);
  const $result = cheerio.load(`
    <div class="accordionbox">
        <ul id="accordion" class="accordion"></ul>
    </div>
    <script>
      window.onload=function() {
        var Accordion = function(el, multiple) {
          this.el = el || {};
          this.multiple = multiple || false;

          // Variables privadas
          var links = this.el.find('.link');
          // Evento
          links.on('click', {el: this.el, multiple: this.multiple}, this.dropdown)
        }

        Accordion.prototype.dropdown = function(e) {
          var $el = e.data.el;
            $this = $(this),
            $next = $this.next();

          $next.slideToggle();
          $this.parent().toggleClass('open');

          if (!e.data.multiple) {
            $el.find('.submenu').not($next).slideUp().parent().removeClass('open');
          };
        }	

        var accordion = new Accordion($('#accordion'), false);
      }
    </script>
  `);

  // expand
  if (args[0] || $ll.length) {
    if ($ll.length) {
      for (var i = 0 ; i < $ll.length ; i++ ){
            var ii = $ll[i].children[0].data.toString().trim().split("\n");
            //  var ss = s.split("\n");
            //  console.info(ii);
            $result('.accordion').append(`<li><div class="link"><i class="fa `+$ll[i].attribs.icon+`"></i>`
            +$ll[i].attribs.title+`<i class="fa fa-chevron-down"></i></div><ul id="ll_`+i+`" class="submenu"></ul></li>`);
             if(ii.length >= 1){
               for(var j = 0 ; j < ii.length ; j++){
                 var source = ii[j].toString();
                 var aurl = "";
                 var acontent = source;
                 if (source.indexOf("url:") > 0){
                   acontent = source.split("url:")[0];
                   aurl = source.split("url:")[1];
                 }
                  $result('#ll_'+i).append(`<li id="ll_`+i+`_ii_`+j+`" class="ii"><a href = "`+aurl+`">`+acontent+`</a></li>`);
               }
            }
        }
     }
  }
  return $result.html();
}, {
  ends: true
});
