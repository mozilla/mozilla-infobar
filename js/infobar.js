'use strict';

var infoBar = (function() {

    var opened = false;
    var bar;
    var disabled;

    return {
        onshow: {},
        onaccept: {},
        oncancel: {},
        addEaseInOut: function () {
            $.extend($.easing, {
                'easeInOut':  function (x, t, b, c, d) {
                    if (( t /= d / 2) < 1) {
                        return c / 2 * t * t + b;
                    }
                    return -c / 2 * ((--t) * (t - 2) - 1) + b;
                }
            });
        },
        init: function(id, name) {
            this.id = id;
            this.name = name;
            this.disabled = false;
            this.prefName = 'infobar.' + id + '.disabled';

            this.addEaseInOut();

            // Read the preference
            try {
                if (sessionStorage.getItem(this.prefName) === 'true') {
                    this.disabled = true;
                }
            } catch (ex) {}

            // If there is already another infobar, don't show this
            if ($('#mozilla-infobar:visible').length) {
                this.disabled = true;
            }

            return infoBar;
        },
        show: function (str) {

            var $infoBar = $('#mozilla-infobar');

            // A infobar can be disabled by pref.
            // And check the existence of another infobar again
            if (this.disabled) {
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
        },
        hide: function () {
            var self = this;
            var target = (opened) ? self.element : bar;

            target.animate({'height': 0}, 200, function () {
                self.element.hide();
                bar.trigger('infobar-hidden');
            });
        },
        updateBar: function(latestVersion, ua, buildID) {

            var latestVersion = parseInt(latestVersion, 10);
            var lang = document.querySelector('html').getAttribute('lang') || '';
            var ua = ua || navigator.userAgent;
            var buildID = buildID || navigator.buildID;
            // Exclude Camino and others
            var isFirefox = ((/\sFirefox\/\d+/).test(ua) && !(/like\ Firefox|Iceweasel|SeaMonkey/i).test(ua));
            var isMobile = (/Mobile|Tablet|Fennec/i).test(ua);
            var userVersion = (isFirefox) ? parseInt(ua.match(/Firefox\/(\d+)/)[1], 10) : 0;
            var isFirefox31ESR = !isMobile && userVersion === 31 && buildID && buildID !== '20140716183446';

            var _updateBar = this.init('update');

            if (_updateBar.disabled || !isFirefox || isMobile || isFirefox31ESR || userVersion > latestVersion) {
                return false;
            }

            // Show the Update Bar if the user's major version is older than 3 major
            // versions. Once the Mozilla.UITour API starts providing the channel
            // info (Bug 1065525, Firefox 35+), we can show the Bar only to Release
            // channel users. 31 ESR can be detected only with the navigator.buildID
            // property. 20140716183446 is the non-ESR build ID that can be found at
            // https://wiki.mozilla.org/Releases/Firefox_31/Test_Plan
            if (userVersion < latestVersion - 2) {
                _updateBar.show('update-bar');

                // If the user accepts, show the SUMO article
                _updateBar.onaccept.callback = function () {
                    location.href = 'https://support.mozilla.org/' + lang + '/kb/update-firefox-latest-version';
                };

                return true;
            }
        }
    }
})();
