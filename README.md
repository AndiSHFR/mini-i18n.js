JavaScript module to switch the user interface language on the fly without reloading the page.

On elements you want to switch the language text you have to add an attribute (_data-lang-ckey="..."_) to the element. The value of the attribute is the key into the language data.

When switching the language the content, title or placeholder of the element will be set according to value of the attribute.

# Requirements
To use _mini-i18n_ you need
* JavaScript enabled.
* include [jQuery](http://jquery.org/)  before _mini-i18n_.
* Pass language text data to _mini-i18n_, either direct or via an api url.

# Minimal example
Here is a minimal working example:

```html
<html lang="en">
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <button data-lang-switch="en-US">English</button>
    <button data-lang-switch="de-DE">Deutsch</button>
    <hr>

    <h1 data-lang-ckey="catalog">Catalog</h1>
    <h4 data-lang-ckey="northern">Northern</h4>
    <small data-lang-ckey="last_update">Last update:</small>

    <script src="https://code.jquery.com/jquery-1.9.1.min.js"></script>
    <script src="https://raw.githubusercontent.com/AndiSHFR/mini-i18n.js/master/mini-i18n.js"></script>
    
    <script>
    $.fn.miniI18n({ 
      data: {
        'de-DE': {
          'catalog': 'Katalog',
          'northern': 'nördlich',
          'last_update': 'Letzte Aktualisierung',
        },
        'en-US': {
          'catalog': 'Catalog',
          'northern': 'nothern',
          'last_update': 'Last update',
        }
      }
    });

    $(function() {
      $.fn.miniI18n('en-US');
    });
    </script>

  </body>
</html>
```


# Attributes used
To control the behaviour of the module you need to add attributes to your page elements.

## __data-lang-switch__
Use this attribute to mark an element that is able to switch the language. i.e. a button or link. The value of the attribute will be the name of the language to switch to.

```html
<button data-lang-switch="en-US">English</button>
``` 

## __data-lang-ckey__
Use this attribute to set the öanguage text key for the content of the element.

```html
<label data-lang-ckey="fname">...</label><input type="text" />
``` 

## __data-lang-tkey__
Use this attribute to set the language text key for the title attribute of the element.

```html
<label data-lang-tkey="fname" title="-">...</label><input type="text" />
``` 

### __data-lang-pkey__
Use this attribute to set the language text key for the placeholder attribute of the element.

```html
<input type="text" placeholder="..." data-lang-pkey="fname" />
``` 


# Flat vs. Nested Language Data
Usually the language data comes as a list of key/value pairs.

```json
{
  "fname": "Firstname",
  "lname": "Lastname",
  "city": "City",
  "zip": "Zip"
  }
```

You will specify this data as simple as

```html
<p><label data-lang-ckey="fname">...</label><input type="text" /></p>
<p><label data-lang-ckey="lname">...</label><input type="text" /></p>
```

However, sometimes it is more convenient to bring more structure into the language data. So _mini-i18n_ supports nested/structred language data.

This helps organizing language text on a per module base in different files and combine them on the server side into one huge download.

```json
{
  "address": {
    "fname": "Firstname",
    "lname": "Lastname",
    "city": "City",
    "zip": "Zip"
    },
  "login" : {
    "uname": "Username",
    "pword": "Password"
    }
  }
```

With the structure above you can use the following way to specify the language key:

```html
<label data-lang-ckey="address.fname">-</label><input type="text" />
<label data-lang-ckey="address.lname">-</label><input type="text" />
```

# License

`mini-i18n` is [MIT licensed](https://github.com/AndiSHFR/mini-i18n.js/raw/master/LICENSE).
