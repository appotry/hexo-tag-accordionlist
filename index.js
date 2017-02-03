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
    // console.info(data);
    return data;
  }
});

// register the accordionlist tag
hexo.extend.tag.register('accordionlist', function(args, content) {
  const _wrapName = `wrap-${Math.random().toString(32).substr(2, 4)}`;
  const $ = cheerio.load(`<div class="${_wrapName}">${content}</div>`, { decodeEntities: false });;
  const $content = $(`.${_wrapName}`);

  const $page = $content.find('page');
  const $result = cheerio.load(`
    <div class="accordionlistbox">
      <div class="accordionlistbox-result"></div>
    </div>
    <script>
      window.onload=function() {
        $("#intro_0").css("display","block");
      };
      var random;
      function accordionlist (){
        random = parseInt(Math.random()*$(".accordionlistbox-intro").length)
        $(".accordionlistbox-intro").css("display","none");
        $("#intro_"+random).css("display","block");
        // $('html, body').animate({scrollTop:0}, 'normal');
        // $('html, body').animate(
        //   {scrollTop: $("#intro_"+random).parent().offset().top - 100 }, 
        //   {duration: 500,easing: "swing"}
        // );
      }
    </script>
  `);

  // expand
  if (args[0] || $page.length) {
    if ($page.length) {
      for (var i = 0 ; i<$page.length ; i++ ){
            $result('.accordionlistbox-result').append(`<div id="intro_`+i+`" class="accordionlistbox-intro">${marked($page[i].children[0].data)}</div>`);
       }
     }
    if ($page.length>1) {
     $result('.accordionlistbox').prepend("<span class='accordionlistbox-meta-collapse' onClick='accordionlist()'></span>");
     $result('.accordionlistbox').append('<div class="accordionlistbox-code-wrap"></div>');
    }
  }
  return $result.html();
}, {
  ends: true
});
