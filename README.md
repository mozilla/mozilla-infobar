# mozilla-infobar

## Using the InfoBar

Add the following two lines before the closing `body` tag of your HTML page.

``` html
<!-- You can also include jQuery from a CDN or other source -->
<script src="/js/libs/jquery.js"></script>
<script src="/js/infobar.js"></script>
```

Next include the base HTML of the InfoBar anywhere inside the HTML of your document. As it is positioned absolutely, placing this at the end of your main content will work.

``` html
<div id="mozilla-infobar" class="mozilla-infobar" role="dialog" aria-hidden="true">
  <p></p>
  <ul>
    <li><button class="btn-accept" type="button"></button></li>
    <li><button class="btn-cancel" type="button"></button></li>
  </ul>
</div>
```

There is an imporant attribute missing from the above, and without it, the InfoBar will not work. The attribute in question here is the `data-infobar` attribute. This attribute can have one of two values, `update` or `translate` as follows:

``` html
<div ... data-infobar="update">
....
```

The above will trigger the Update bar and will be shown if the current user is using a version of Firefox that is two major versions older than the latest.

If the value above is translate, it will show the Translation Bar based in the precense of some additional elements as described later. You can also specify both, as such:

``` html
<div ... data-infobar="update translate">
....
```

The order here is important, as wo InfoBar elements will never be shown simultaneously. In the scenario above, the first time the page is loaded, the logic for the update bar will be run. Once the user has taken the required action or, dismissed the notification, the translate bar's logic will b run on subsequent page loads.

## Translate Bar Usage Specifics

As mentioned above, the Translation Bar has some additional requirements in order to function. Over and above the already detailed requirements, the Translation Bar will look for either `link` elements with the `hreflang` attribute or a `select` element with an `id` attribute of `page-language-select` contained inside a simple form container.

In the first instance, you would add `link` elements such as the following to the `head` of your document:

```
<link rel="alternate" hreflang="es-ES" href="http://www.mozilla.org/es-ES/firefox/new/" title="English (US)" />
<link rel="alternate" hreflang="fr" href="http://www.mozilla.org/fr/firefox/new/" title="Français" />
```

These list the alternate languages the current page is available in, as well as the URL to redirect the user to. The alternative is to make use of a language selector, using a `select` element.

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
