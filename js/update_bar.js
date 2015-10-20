'use strict';

var updateBar = (function() {

    return {
        init: function(latestVersion, ua, buildID) {

            var latestVersion = parseInt(latestVersion, 10);
            var ua = ua || navigator.userAgent;
            var buildID = buildID || navigator.buildID;
            // Exclude Camino and others
            var isFirefox = ((/\sFirefox\/\d+/).test(ua) && !(/like\ Firefox|Iceweasel|SeaMonkey/i).test(ua));
            var isMobile = (/Mobile|Tablet|Fennec/i).test(ua);
            var userVersion = (isFirefox) ? parseInt(ua.match(/Firefox\/(\d+)/)[1], 10) : 0;
            var isFirefox31ESR = !isMobile && userVersion === 31 && buildID && buildID !== '20140716183446';

            var _updateBar = window.infoBar.init();

            console.log('latestVersion', latestVersion);
            console.log('ua', ua);
            console.log('buildID', buildID);
            console.log('isFirefox', isFirefox);
            console.log('isMobile', isMobile);
            console.log('userVersion', userVersion);
            console.log('isFirefox31ESR', isFirefox31ESR);
            console.log('_updateBar.disabled', _updateBar.disabled);

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
                    location.href = 'https://support.mozilla.org/{{ LANG }}/kb/update-firefox-latest-version';
                };

                return true;
            }
        }
    }

})();
