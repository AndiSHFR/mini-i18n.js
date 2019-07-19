/*!
 * mini-i18n.js JavaScript Library v1.0.0 
 * http://github.com/AndiSHFR/mini-i18n/
 * 
 * Copyright 2017 Andreas Schaefer
 * Licensed under the MIT license
 * 
 * @file 
 * JavaScript module to switch text elements in a web page on the fly.
 * The intended use is for switching display language on a web page.
 * For language IDs see http://www.localeplanet.com/icu/iso639.html 
 *                   or https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 */

if ('undefined' === typeof jQuery) {
  throw new Error('mini-i18n\'s JavaScript requires jQuery.')
}

+function ($) {
  'use strict';
  var version = $.fn.jquery.split(' ')[0].split('.')
  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
    throw new Error('mini-i18n\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4. You are using version ' + $.fn.jquery);
  }
}(jQuery);



+function(window, $, undefined) {
  'use strict';

  // PRIVATE

  var 
    
    err = undefined,
    
    // Available language texts strings
    languageData = {},

    // Global options for this module
    options = {
      // True will output debug information on the developer console
      debug: false,       
      // css style to be applied to the element if the language text for the key was not found
      notFound: 'lang-not-found',
      // Uri to download locale texts. Must contain language placeholder. i.e. /locale/{{LANG}}.json
      source: undefined,
      // User callback to be called _before_ a text is assigned to an element.
      // If the callback returns true the default behaviour will not be executed.
      onItem: undefined,
      // User function called after the localization has taken place. 
      changed: undefined,
      // Either the language data, a callback to return the language data or an url to fetch the language data
      data: undefined
    },

    /**
     * Output debug information to the developer console
     *
     * @param {object} args_
     * @return
     * @api private
     */
    debug = function(args_) {
      if(console && options.debug) {
        var args = [].slice.call(arguments);
        args.unshift('mini-i18n: ');
        console.log.apply(null, args);
      }
    },  

    /**
     * Get a value from an object by its path
     *
     * @param {object} obj
     * @param {string} path
     * @return {object}
     * @api private
     */
    deepValue = function(obj, path) {
      if('string' !== typeof path) return obj;
      path = path.replace(/\[(\w+)\]/g, '.$1');   // convert indexes to properties
      path = path.replace(/^\./, '').split('.');  // strip a leading dot and split at dots
      var i = 0, len = path.length;               
      while(obj && i < len) {
        obj = obj[path[i++]];
      }
      return obj;
    },

    explainAjaxError = function (jqXHR, textStatus, errorThrown) {
      var error = '';
      if (jqXHR.status === 0) {
        error = 'Not connected. Please verify your network connection.';
      } else if (jqXHR.status == 404) {
        error = '404 - The requested page could not be found.';
      } else if (jqXHR.status == 500) {
        error = '500 - Internal Server Error.';
      } else if (textStatus === 'parsererror') {
        error = 'Requested JSON parse failed.';
      } else if (textStatus === 'timeout') {
        error = 'Time out error.';
      } else if (textStatus === 'abort') {
        error = 'Ajax request aborted.';
      } else {
        error = 'Unknown Error Reason ' + jqXHR.status;
      }

      return {
        error: error,
        details: jqXHR.responseText
      };
    },

    parseIniString = function(data){
      var regex = {
          section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
          param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
          comment: /^\s*;.*$/
      };
      var value = {};
      var lines = data.split(/[\r\n]+/);
      var section = null;
      lines.forEach(function(line){
          if(regex.comment.test(line)){
              return;
          }else if(regex.param.test(line)){
              var match = line.match(regex.param);
              if(section){
                  value[section][match[1]] = match[2];
              }else{
                  value[match[1]] = match[2];
              }
          }else if(regex.section.test(line)){
              var match = line.match(regex.section);
              value[match[1]] = {};
              section = match[1];
          }else if(line.length == 0 && section){
              section = null;
          };
      });
      return value;
  },
      
    /**
     * Loops thru all language elements and sets the current language text
     * 
     * @param {string} lang
     * @return
     * @api private
     */
    updateElements = function(lang, data) {
      debug('Updating elements with language: ' + lang, data, languageData);

      // Select all elements and loop thru them
      $('[data-lang-ckey],[data-lang-tkey],[data-lang-pkey]').each(function () {
        var 
          $this = $(this),                     // jQuery object of the element
          ckey = $this.attr('data-lang-ckey'), // Key for the content of the element
          tkey = $this.attr('data-lang-tkey'), // Key for title attribute of the element
          pkey = $this.attr('data-lang-pkey'), // Key for placeholder attribute of the element
          cval = deepValue(data, ckey),        // Value of the content
          tval = deepValue(data, tkey),        // Value of the title attribute
          pval = deepValue(data, pkey)         // Value of the placeholder attribute
          ;

        // Execute callback and if the result is false run the default action
        if(!options.onItem || 
           !options.onItem.apply(
             null, 
             [lang, 
              { 
               content: { key: ckey, val: cval}, 
               title: {key: tkey, val: tval}, 
               placeholder: { key: pkey, val:pval }
              }
            ]
            )
          ) {

          // If there is a content key set the content and handle "not found" condition
          if(ckey) {
            $this
            .removeClass(options.notFound)
            .html(cval)
            .addClass( (cval ? undefined : options.notFound ) );
          }          
          // If there is a title key set the title attribute and handle "not found" condition
          if(tkey) {
            $this
            .removeClass(options.notFound)
            .attr('title', (tval || $this.attr('title')) )
            .addClass( (tval ? undefined : options.notFound ) );
          }
          // If there is a placeholder key set the placeholder attribute and handle "not found" condition
          if(pkey) {
            $this
            .removeClass(options.notFound)
            .attr('placeholder', (pval || $this.attr('placeholder')) )
            .addClass( (pval ? undefined : options.notFound ) );
          }
        }
      });

      options.changed && options.changed.apply(null, [err, lang, data]);
    },

    switchLanguage = function(lang, cb) {
      var 
        data = languageData[lang],
        source = undefined
        ;

      if(!data) {
        if('string' == typeof options.source) {
          debug('Prepare source from string:', options.source);
          source = options.source.replace('{{LANG}}', lang); 
        } else 

        if('function' == typeof options.source) {
          debug('Prepare source by calling:', options.source);
          source = options.source.apply(null, [lang]);
        }

        if(source) {
          debug('Will load language data for "' + lang + '" from source:', source);
          $.ajax({
            url: source,
            success: function(data_, textStatus, jqXHR) { 
             debug('Received language data:', data_);
             if('string' == typeof data_) {
              languageData[lang] = parseIniString(data_);
             }else {
              languageData[lang] = data_;
             }              
             data = languageData[lang];
             cb && cb.apply(null, [lang, data]);
            },
            error: function(jqXHR, textStatus, errorThrown) {
              err = explainAjaxError(jqXHR, textStatus, errorThrown);
              cb.apply(null, [lang, data]);
            }
          });
        } else {
          debug('No language data and no source for language:', lang);
          cb && cb.apply(null, [lang, data]);  
        }

      } else {
        cb && cb.apply(null, [lang, data]);
      }
    },

      /**
       * Switch language text on elements
       * 
       * @param {string} lang
       * @return
       * @api private
       */
      language = function(lang) {        
        err = undefined;
        debug('Switching to language: ', lang);
        switchLanguage(lang, updateElements);
      },

      /**
       * Sets configuration values 
       * 
       * @param {object} options_
       * @return
       * @api private
       */
      configure = function(options_) {
        debug('Configuring with: ', options_);
        options = $.extend({}, options, options_);
        languageData = options.data || {};
      }

      ;

  // PUBLIC

  /**
   * Public mini-i18n method.
   * Can be called in two ways.
   * Setting options    : p is an object with configuration settings.
   * Switching language : p is a string with the language name. i.e. 'en-US'
   * 
   * @param {object|string} p 
   * @return
   * @api public
   */
  $.fn.extend({
    miniI18n : function(p) {
      if('string' === typeof p) return language(p);
      if('object' === typeof p) return configure(p);
      throw new Error('Argument must be a string or an object with configuration values.');
    }
  });


  $(function() {
    // Auto initialize elements with attribute "data-lang-switch"
    $('[data-lang-switch]').on('click.mini-i18n', function(e) {
      var lang = $(this).attr('data-lang-switch');
      if(lang) $.fn.miniI18n(lang);
    });
  });

}(window, jQuery);
