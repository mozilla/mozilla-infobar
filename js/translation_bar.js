Infobar.translation = function (userLangs, pageLang) {
    var transbar = new Infobar('transbar', 'Translation Bar');

    // Note that navigator.language doesn't always work because it's just
    // the application's locale on some browsers. navigator.languages has
    // not been widely implemented yet, but the new property provides an
    // array of the user's accept languages that we'd like to see.
    userLangs = userLangs || navigator.languages;
    pageLang = pageLang || document.documentElement.lang;

    if (transbar.disabled || !userLangs || !pageLang) {
        return false;
    }

    // Normalize the user language in the form of ab or ab-CD
    var normalize = function (lang) {
        return lang.replace(/^(\w+)(?:-(\w+))?$/, function (m, p1, p2) {
            return p1.toLowerCase() + ((p2) ? '-' + p2.toUpperCase() : '');
        });
    };

    // Normalize every language for easier comparison
    userLangs = $.map(userLangs, function (lang) { return normalize(lang); });
    pageLang = normalize(pageLang);

    // If the page language is the user's primary language, there is nothing
    // to do here
    if (pageLang === userLangs[0]) {
        return false;
    }

    var offeredLang;
    var availableLangs = {};
    var $links = $('link[hreflang]');
    var $options = $('#language option');

    // Make a dictionary from alternate URLs or a language selector. The key
    // is a language, the value is the relevant <link> or <option> element.
    // If those lists cannot be found, there is nothing to do
    if ($links.length) {
        $links.each(function () {
            availableLangs[normalize(this.hreflang)] = this;
        });
    } else if ($options.length) {
        $options.each(function () {
            availableLangs[normalize(this.value.match(/^\/?([\w\-]+)/)[1])] = this;
        });
    } else {
        return false;
    }

    // Compare the user's accept languages against the page's current
    // language and other available languages to find the best language
    $.each(userLangs, function(index, userLang) {
        if (pageLang === userLang || pageLang === userLang.split('-')[0]) {
            offeredLang = 'self';
            return false; // Break the loop
        }

        if (userLang in availableLangs) {
            offeredLang = userLang;
            return false; // Break the loop
        }
    });

    // If the page language is one of the user's secondary languages and no
    // other higher-priority language cannot be found in the translations,
    // there is nothing to do
    if (offeredLang === 'self') {
        return false;
    }

    // If an offered language cannot be detected, try again with shorter
    // language names, like en-US -> en, fr-FR -> fr
    if (!offeredLang) {
        $.each(userLangs, function(index, userLang) {
            userLang = userLang.split('-')[0];

            if (userLang in availableLangs) {
                offeredLang = userLang;
                return false; // Break the loop
            }
        });
    }

    // If there is no offered language yet, there is nothing to do
    if (!offeredLang) {
        return false;
    }

    // Do not show Chrome's built-in Translation Bar
    $('head').append('<meta name="google" value="notranslate">');

    // Log the language of the current page
    transbar.onshow.trackLabel = transbar.oncancel.trackLabel = offeredLang;
    transbar.oncancel.trackAction = 'hide';

    // If the user selects Yes, show the translated page
    transbar.onaccept = {
        trackAction: 'change',
        trackLabel: offeredLang,
        callback: function () {
            var element = availableLangs[offeredLang];

            if (element.form) { // <option>
                element.selected = true;
                element.form.submit();
            } else { // <link>
                location.href = element.href.replace(/^https?\:\/\/[^/]+/, '');
            }
        }
    };

    // Fetch the localized strings and show the Translation Bar
    $.ajax({ url: '{{ settings.CDN_BASE_URL }}/' + offeredLang + '/tabzilla/transbar.jsonp',
             cache: true, crossDomain: true, dataType: 'jsonp',
             jsonpCallback: "_", success: function (str) {
        transbar.show(str).attr({
            'lang': offeredLang,
            'dir': ($.inArray(offeredLang, {{ settings.LANGUAGES_BIDI|list|safe }}) > -1) ? 'rtl' : 'ltr'
        });
    }});

    return offeredLang;
};
