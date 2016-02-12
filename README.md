# mozilla-infobar

This is the home of the Mozilla, Firefox Update, and Translation Bars. These bars, in the first case, provide an easy way to let your users know that there is a newer version of Firefox available, and that they should upgrade.

In the second instance, it enables you to notify your users when the current page they are viewing, is available in their preferred language.

## Getting the InfoBar

There are three ways to get the code.

### Using Git

First step is to clone the project.

``` bash
git clone git@github.com:mozilla/mozilla-infobar.git
```

Once the above operation has finished, you need to copy the following files to your project in the appropriate directories.

``` bash
css/infobar.css
js/infobar.js
```

For additional information on using Bower packages [see the Bower documentation](http://bower.io/#use-packages).

### Using Bower

You can also install it as a Bower package

``` bash
bower install moziila-infobar
```

## Using the InfoBar

Once you have the code, add the following two lines before the closing `body` tag of your main project page.

``` html
<!-- You can of course use any CDN of you choice or serve it from your own server -->
<script src="http://code.jquery.com/jquery-2.2.0.min.js"></script>
<script src="/js/infobar.js"></script>
```

Next include the HTML for the InfoBar anywhere inside the HTML of your document. As it is positioned absolutely, placing this at the end of your main content will work.

``` html
<div id="mozilla-infobar" class="mozilla-infobar infobar-hidden" role="dialog" aria-hidden="true">
  <p></p>
  <ul>
    <li><button class="btn-accept" type="button"></button></li>
    <li><button class="btn-cancel" type="button"></button></li>
  </ul>
</div>
```

There is an imporant attribute missing from the above, and without it, the InfoBar will not work. The attribute in question here is the `data-infobar` attribute. This attribute can have one, or both, of two possible values, `update` and `translate`. For example:

``` html
<div ... data-infobar="update">
```

The above will trigger the Update Bar to be shown if the current user is using a version of Firefox that is two major versions older than the latest release version.

If the value above is translate, it will show the Translation Bar based on the precense of some additional elements as described later. You can also specify both, as such:

``` html
<div ... data-infobar="update translate">
```

The order here is important, as both InfoBar elements will never be shown simultaneously. In the scenario above, the first time the page is loaded, the Update Bar will be run. Once the user has taken either of the available actions, the Translation Bar will be shown on subsequent page loads.

NOTE: Once a user has taken either of the available actions, that InfoBar will not be shown again for the duration of the user's session. Should they close the current tab/window and come back to said page, the bar will be shown again, if the user's browser is, either still out of date or, they are accessing the page in a locale other than their preferred, as applicable.

## Translation Bar Usage Specifics

As mentioned above, the Translation Bar has some additional requirements in order to function. Over and above the already detailed requirements, the Translation Bar will look for either `link` elements with the `hreflang` attribute or a `select` element with an `id` attribute of `page-language-select`.

In the first instance, you would add `link` elements to the `head` of your document. For example:

``` html
<link rel="alternate" hreflang="es-ES" href="http://www.mozilla.org/es-ES/firefox/new/" title="English (US)" />
<link rel="alternate" hreflang="fr" href="http://www.mozilla.org/fr/firefox/new/" title="Français" />
```

These list the alternate languages the current page is available in, as well as the URL to redirect the user to. For smaller websites, or those only supporting a small selection of locales, hard coding these may be an option. Should your site support many locales, it would be wise to investigate generating these `link` elements using a server side language, coupled with template tags if required.

The alternative is to make use of a language selector, using a `select` element.

NOTE: This option will also require server side logic to redirect the user to the approrpiate page based on the value of the `lang` parameter passed.

``` html
<form id="lang_form" method="get" action="#">
  <label for="page-language-select">Other languages:</label>
  <select id="page-language-select" name="lang" dir="ltr">
    <option value="en-US" selected="" lang="en-US">English</option>
    <option value="eo" lang="eo">Esperanto</option>
    <option value="es-AR" lang="es-AR">Español (de Argentina)</option>
  </select>
  <noscript>
    <button type="submit">Go</button>
  </noscript>
</form>
```
