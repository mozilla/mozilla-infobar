'use strict';

var $infoBar = $('#mozilla-infobar');
var opened = false;

var bar;
var json;
var lang;

var InfoBar = function (id, name) {
    this.id = id;
    this.name = name;
    this.disabled = false;
    this.prefName = 'infobar.' + id + '.disabled';

    // Read the preference
    try {
        if (sessionStorage.getItem(this.prefName) === 'true') {
            this.disabled = true;
        }
    } catch (ex) {
        console.log('Error thrown while getting disabled state from sessionStorage: ', ex);
    }

    // If there is already another infobar, don't show this
    if ($infoBar.filter(':visible').length) {
        this.disabled = true;
    }

};

/**
 * Main function called afer document.ready
 */
InfoBar.prototype.setup = function() {
    lang = document.querySelector('html').getAttribute('lang') || '';
    var bars = $infoBar.data('infobar').split(' ');

    try {

        json = JSON.parse(sessionStorage.getItem('infobar.json'));

        // check if the JSON exists in sessionStorage
        if (!json) {
             // This loads the data for the transbar which also contains the latest fx version string.
             $.ajax({
                 url: 'http://localhost:4000/' + lang + '/tabzilla/transbar.jsonp',
                 cache: true,
                 crossDomain: true,
                 dataType: 'jsonp',
                 jsonpCallback: '_',
                 success: function(data) {
                     // store the returned JSON in sessionStorage to avoid additional Ajax calls
                     // during this user session.
                     try {
                         sessionStorage.setItem('infobar.json', JSON.stringify(data));
                     } catch(ex) {
                         console.log('Error while storing JSON in sessionStorage: ', ex);
                     }

                     json = data;
                     $(bars).each(function(index, value) {
                         InfoBar[value].call();
                     })
                 }
             }).fail(function(jqXHR, textStatus, errorThrown) {
                 console.log('Error thrown while loading JSON:');
                 console.log('textStatus: ', textStatus);
                 console.log('errorThrown: ', errorThrown);
             });
        } else {
            // the JSON has already been loaded earlier in this session.
            $(bars).each(function(index, value) {
                InfoBar[value].call();
            })
        }
    } catch (ex) {
        console.log('Error thrown while getting json from sessionStorage: ', ex);
    }
}

InfoBar.prototype.onshow = {};
InfoBar.prototype.onaccept = {};
InfoBar.prototype.oncancel = {};

/**
 * Shows the relevant bar, binding events to the buttons.
 */
InfoBar.prototype.show = function () {

    // An infobar can be disabled by pref.
    // Also, ensure there is no current active infobar
    if (this.disabled || $infoBar.filter(':visible').length) {
        return;
    }

    var self = this;
    bar = self.element = $infoBar;

    bar.find('.btn-accept').click(function (event) {
        event.preventDefault();

        if (self.onaccept.callback) {
            self.onaccept.callback();
        }

        self.hide();
    });

    bar.find('.btn-cancel').click(function (event) {
        event.preventDefault();

        if (self.oncancel.callback) {
            self.oncancel.callback();
        }

        self.hide();
        try {
            sessionStorage.setItem(self.prefName, 'true');
        } catch (ex) {}
    });

    if (self.onshow.callback) {
        self.onshow.callback();
    }

    if (opened) {
        bar.hide();
    } else {
        bar.show();
    }

    return bar;
};

/**
 * Hides the currently visible infoBar
 */
InfoBar.prototype.hide = function () {
    var self = this;
    var target = (opened) ? self.element : bar;

    target.animate({'height': 0}, 200, function () {
        self.element.hide();
        bar.trigger('infobar-hidden');
    });
};

/**
 * This implements the update bar, shown for Firefox desktop users that has a version
 * installed two major versions older than the latest.
 * @param latestVersion {string} - Latest major version of Firefox (optional)
 * @param ua {string} - The userAgent string (optional)
 * @param buildID {int} - The UA buildID (optional)
 */
InfoBar.update = function(latestVersion, ua, buildID) {

    var ua = ua || navigator.userAgent;
    var buildID = buildID || navigator.buildID;

    // Exclude Camino and others
    var isFirefox = ((/\sFirefox\/\d+/).test(ua) && !(/like\ Firefox|Iceweasel|SeaMonkey/i).test(ua));
    var isMobile = (/Mobile|Tablet|Fennec/i).test(ua);
    var isFirefox31ESR = !isMobile && userVersion === 31 && buildID && buildID !== '20140716183446';

    var latestVersion = parseInt(latestVersion || json.latestfx, 10);
    var userVersion = (isFirefox) ? parseInt(ua.match(/Firefox\/(\d+)/)[1], 10) : 0;

    var updateBar = new InfoBar('update', 'Update Bar');

    if (updateBar.disabled || !isFirefox || isMobile || isFirefox31ESR ||
        userVersion > latestVersion) {
        return false;
    }

    // Show the Update Bar if the user's major version is older than 3 major
    // versions. Once the Mozilla.UITour API starts providing the channel
    // info (Bug 1065525, Firefox 35+), we can show the Bar only to Release
    // channel users. 31 ESR can be detected only with the navigator.buildID
    // property. 20140716183446 is the non-ESR build ID that can be found at
    // https://wiki.mozilla.org/Releases/Firefox_31/Test_Plan
    if (userVersion < latestVersion - 2) {
        updateBar.show();

        // If the user accepts, show the SUMO article
        updateBar.onaccept.callback = function () {
            location.href = 'https://support.mozilla.org/' + lang + '/kb/update-firefox-latest-version';
        };

        return true;
    }
};

$(function() {
    InfoBar.prototype.setup();
});
