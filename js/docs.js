function isKeyChecked(key) {
  return localStorage.getItem(key) === 'true';
}

function setKeyChecked(key, checked) {
  localStorage.setItem(key, checked ? 'true' : 'false');
}

// TODO: make Chrome-supported ES6 instead of mish-mash ES5+6 and add linting
$(function() {
  /**
   * Hacked JQuery
   */

  // formatting
  $('section>h1').wrap('<div class="page-header" />');

  $('nav#sidebar li>input').each(function (index, element) {
    var e = $(element);
    var path = window.location.pathname;
    var href = e.first().attr('data-folder');
    var a = document.createElement('a');
    a.href = href;
    if (path.endsWith('.html')) {
      var arr = path.split('/');
      arr.pop();
      path = arr.join('/');
    }
    console.log(path, a.pathname);
    if (path === a.pathname) {
      e.prop('checked', true);
    }
  });

  $('nav#sidebar li').each(function (index, element) {
    var e = $(element);
    var a = e.children('a').get(0);
    if (a) {
      console.log(window.location.pathname, a.pathname);
    }
    if (a && window.location.pathname === a.pathname) {
      e.addClass('active');
    }
  });

  var accordionsMenu = $('.accordion-menu');


  if( accordionsMenu.length > 0 ) {
    function openSection(checkbox) {
      checkbox.siblings('ul').attr('style', 'display:none;').slideDown(300);
    }

    function closeSection(checkbox) {
      checkbox.siblings('ul').attr('style', 'display:block;').slideUp(300);
      checkbox.siblings('ul').find('input[type="checkbox"]').prop('checked', false);
      checkbox.siblings('ul').find('ul').attr('style', 'display:block;').slideUp(300);
    }

    accordionsMenu.each(function(){
      var accordion = $(this);
      //detect change in the input[type="checkbox"] value
      accordion.on('change', 'input[type="checkbox"]', function(){
        var that = this;
        var checkbox = $(this);
        if (checkbox.prop('checked')) {
          checkbox.parents('ul').first().children('li').children('input').each(function (i, e) {
            if(that !== this && $(this).prop('checked')) {
              $(this).prop('checked', false);
              closeSection($(this));
            }
          });
        }
        ( checkbox.prop('checked') ) ? openSection(checkbox) : closeSection(checkbox);
      });
    });
  }

  // update blockquote CSS
  $('blockquote').addClass('blockquote');

  // update task lists
  $('li').each(function(_, e) {
    var li = $(e);
    var debullet = false;
    if (li.html().startsWith('[ ]')) {
      const key = encodeURIComponent(li.text());
      li.html(
        li.html().replace(/^\[ \]/, '<input type="checkbox" data-key="' + key  + '"' + (isKeyChecked(key) ? ' checked' : '') + '>&nbsp;')
      );
      li.children('input[data-key]').click(function (e) {
        const cb = $(e.target);
        setKeyChecked(cb.attr('data-key'), e.target.checked);
      });
      debullet = true;
    } else if (li.html().startsWith('[x]')) {
      li.html(li.html().replace(/^\[ \]/, '<input type="checkbox" checked>&nbsp;'));
      debullet = true;
    }
    if (debullet) {
      li.css({listStyle: 'none'});
      li.parent().css({padding: '0 0 0 6px'});
    }
  });

  // add togglable regions
  $('.toggle').each(function (i, e) {
    var toggle = $(e);
    var name = toggle.attr('href').substr(1);
    var start = $(`a[name="${name}-start"]`).first();
    var end = $(`a[name="${name}-end"]`).first();
    if (start && end) {
      var span = start.parent().nextUntil(end.parent());
      span.wrapAll(`<section class="collapse" id="${name}-section">`);
      toggle.attr('name', name);
      toggle.attr('href', `#${name}-section`);
      toggle.attr('data-toggle', 'collapse');
      start.parent().remove();
      end.parent().remove();
    } else {
      console.warn(`No toggle start/end found for ${name}`);
    }
  });

  function hashchange() {
    var section = $(`${window.location.hash}-section`).first();
    if (section.length){
      section.addClass('show');
      section.parents('.collapse').addClass('show');
      var offset = section.offset(); 
      $('html, body').animate({
        scrollTop: offset.top - 70, // - 70 allows for top bar
        scrollLeft: offset.left
      });
    }
  }

  $(window).bind('hashchange', hashchange);
  hashchange();

  // TOC
  $('#toc').toc({
    elementClass: 'toc',
    // ulClass: 'nav',
    selector: 'h2, h3, h4, h5, h6',
  });

  // open external URLs in a new window
  $('a').each(function() {
    var a = new RegExp('/' + window.location.host + '/');
    if(!a.test(this.href)) {
      $(this).addClass('external');
      $(this).click(function(event) {
        event.preventDefault();
        event.stopPropagation();
        window.open(this.href, '_blank');
      });
    }
  });

  // Syntax highlighting
  hljs.initHighlighting();

  $('body').css({ display: 'block' });

  // prevent the arrow animation playing on initial page load
  setTimeout(function () {
    accordionsMenu.addClass('animated');
  }, 100);
});
