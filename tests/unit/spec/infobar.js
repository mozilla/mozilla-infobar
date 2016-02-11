/* For reference read the Jasmine and Sinon docs
 * Jasmine docs: http://pivotal.github.io/jasmine/
 * Sinon docs: http://sinonjs.org/docs/
 */

/* global describe, beforeEach, afterEach, it, expect, sinon, spyOn */

describe('infobar.js', function() {

    'use strict';

    describe('InfoBar.prototype.getLanguageBidi', function () {
        it('should return true for a rtl language', function() {
            expect(InfoBar.prototype.getLanguageBidi('he')).toBeTruthy();
        });

        it('should return false for a ltr language', function() {
            expect(InfoBar.prototype.getLanguageBidi('en-US')).toBeFalsy();
        });
    });

    describe('InfoBar.prototype.normalize', function () {
        it('should return en-US when en-us is provided', function() {
            expect(InfoBar.prototype.normalize('en-us')).toBe('en-US');
        });

        it('should return ca when CA is provided', function() {
            expect(InfoBar.prototype.normalize('CA')).toBe('ca');
        });
    });

    describe('InfoBar.prototype.getAvailableLangs - hreflang links', function () {

        beforeEach(function() {
            var hreflangLinks = [
                '<link rel="alternate" hreflang="es-ES" href="http://www.mozilla.org/es-ES/firefox/new/" />',
                '<link rel="alternate" hreflang="fr" href="http://www.mozilla.org/fr/firefox/new/" />'
            ].join();

            $(hreflangLinks).appendTo('head');
        });

        afterEach(function() {
            $('link[hreflang]').remove();
        });

        it('should populate the availableLangs object with two elements from links', function() {
            var availableLangs = InfoBar.prototype.getAvailableLangs();
            expect(Object.keys(availableLangs).length).toBe(2);
        });

        it('should have es-ES entry in availableLangs', function() {
            var availableLangs = InfoBar.prototype.getAvailableLangs();
            expect(availableLangs['es-ES']).toBeDefined();
        });
    });

    describe('InfoBar.prototype.getAvailableLangs - language selector', function() {

        beforeEach(function() {
            var select = [
                '<select id="page-language-select" name="lang" dir="ltr">',
                  '<option value="es-ES" lang="es-ES">Español (de España)</option>',
                  '<option value="fr" lang="fr">Français</option>',
                 '</select>'
            ].join();

            $(select).appendTo('body');
        });

        afterEach(function() {
            $('#page-language-select').remove();
        });

        it('should populate the availableLangs object with two elements from options', function() {
            var availableLangs = InfoBar.prototype.getAvailableLangs();
            expect(Object.keys(availableLangs).length).toBe(2);
        });

        it('should have fr entry in availableLangs', function() {
            var availableLangs = InfoBar.prototype.getAvailableLangs();
            expect(availableLangs['fr']).toBeDefined();
        });

    });

    describe('InfoBar.prototype.getAvailableLangs - no translations', function() {
        it('should return false if no translations exists', function() {
            var isAvailableLangs = InfoBar.prototype.getAvailableLangs();
            expect(isAvailableLangs).toBeFalsy();
        });
    });

    describe('InfoBar.prototype.userLangPageLangMatch', function() {
        it('should return true if the users language matches the page language', function() {
            var acceptLangs = ['en-US', 'en'];
            var match = InfoBar.prototype.userLangPageLangMatch(acceptLangs, 'en');
            expect(match).toBeTruthy();
        });

        it('should return false if the users language does not match the page language', function() {
            var acceptLangs = ['en-US', 'en'];
            var match = InfoBar.prototype.userLangPageLangMatch(acceptLangs, 'es-ES');
            expect(match).toBeFalsy();
        });
    });

    describe('InfoBar.prototype.getOfferedLang', function() {

        beforeEach(function() {
            var hreflangLinks = [
                '<link rel="alternate" hreflang="en-US" href="http://www.mozilla.org/en-US/firefox/new/" />',
                '<link rel="alternate" hreflang="fr" href="http://www.mozilla.org/fr/firefox/new/" />'
            ].join();

            $(hreflangLinks).appendTo('head');
        });

        afterEach(function() {
            $('link[hreflang]').remove();
        });

        it('should return en-US as the offeredLang', function() {
            var acceptLangs = ['en-US', 'en'];
            var offeredLang = InfoBar.prototype.getOfferedLang(acceptLangs, 'es-ES');
            expect(offeredLang).toBe('en-US');
        });
    });

    describe('InfoBar.prototype.getOfferedLang - pageLang equals userLang', function() {

        beforeEach(function() {
            var hreflangLinks = [
                '<link rel="alternate" hreflang="es-ES" href="http://www.mozilla.org/en-US/firefox/new/" />',
                '<link rel="alternate" hreflang="fr" href="http://www.mozilla.org/fr/firefox/new/" />'
            ].join();

            $(hreflangLinks).appendTo('head');
        });

        afterEach(function() {
            $('link[hreflang]').remove();
        });

        it('should return false as userLang matches pageLang', function() {
            var acceptLangs = ['es-ES', 'es'];

            var offeredLang = InfoBar.prototype.getOfferedLang(acceptLangs, 'es-ES');
            expect(offeredLang).toBeFalsy();

            offeredLang = InfoBar.prototype.getOfferedLang(acceptLangs, 'es');
            expect(offeredLang).toBeFalsy();
        });
    });

    describe('InfoBar.prototype.isLikeFirefox', function() {

        it('should consider SeaMonkey to be like Firefox', function() {
            var ua = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0 SeaMonkey/2.37a1';
            var result = InfoBar.prototype.isLikeFirefox(ua);
            expect(result).toBeTruthy();
        });

        it('should consider IceWeasel to be like Firefox', function() {
            var ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:17.0) Gecko/20121202 Firefox/17.0 Iceweasel/17.0.1';
            var result = InfoBar.prototype.isLikeFirefox(ua);
            expect(result).toBeTruthy();
        });

        it('should consider IceCat to be like Firefox', function() {
            var ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:17.0) Gecko/20121201 icecat/17.0.1';
            var result = InfoBar.prototype.isLikeFirefox(ua);
            expect(result).toBeTruthy();
        });

        it('should consider Camino to be like Firefox', function() {
            var ua = 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10.4; en; rv:1.9.2.24) Gecko/20111114 Camino/2.1 (like Firefox/3.6.24)';
            var result = InfoBar.prototype.isLikeFirefox(ua);
            expect(result).toBeTruthy();
        });

        it('should consider Camino like userAgent to be like Firefox', function() {
            var ua = 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10.4; en; rv:1.9.2.24) Gecko/20111114 (like Firefox/3.6.24)';
            var result = InfoBar.prototype.isLikeFirefox(ua);
            expect(result).toBeTruthy();
        });

        it('should not consider Firefox to be "like" Firefox', function() {
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20100101 Firefox/23.0';
            var result = InfoBar.prototype.isLikeFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it('should not consider Chrome to be like Firefox', function() {
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.57 Safari/537.36';
            var result = InfoBar.prototype.isLikeFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it('should not consider Safari to be like Firefox', function() {
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2';
            var result = InfoBar.prototype.isLikeFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it('should not consider IE to be like Firefox', function() {
            var ua = 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)';
            var result = InfoBar.prototype.isLikeFirefox(ua);
            expect(result).not.toBeTruthy();
        });
    });

    describe('InfoBar.prototype.isFirefoxMobile', function() {

        it('should return false for Firefox on Desktop', function() {
            var ua = 'Mozilla/5.0 (Windows NT x.y; rv:10.0) Gecko/20100101 Firefox/10.0';
            expect(InfoBar.prototype.isFirefoxMobile(ua)).not.toBeTruthy();

            ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:10.0) Gecko/20100101 Firefox/10.0';
            expect(InfoBar.prototype.isFirefoxMobile(ua)).not.toBeTruthy();

            ua = 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0';
            expect(InfoBar.prototype.isFirefoxMobile(ua)).not.toBeTruthy();
        });

        it('should return true for Firefox Android on Phone', function() {
            var ua = 'Mozilla/5.0 (Android; Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';
            var result = InfoBar.prototype.isFirefoxMobile(ua);
            expect(result).toBeTruthy();
        });

        it('should return true for Firefox Android on Tablet', function() {
            var ua = 'Mozilla/5.0 (Android; Tablet; rv:26.0) Gecko/26.0 Firefox/26.0';
            var result = InfoBar.prototype.isFirefoxMobile(ua);
            expect(result).toBeTruthy();
        });

        it('should return true for Firefox OS on Phone', function() {
            var ua = 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0';
            var result = InfoBar.prototype.isFirefoxMobile(ua);
            expect(result).toBeTruthy();
        });

        it('should return true for Firefox OS on Tablet', function() {
            var ua = 'Mozilla/5.0 (Tablet; rv:26.0) Gecko/26.0 Firefox/26.0';
            var result = InfoBar.prototype.isFirefoxMobile(ua);
            expect(result).toBeTruthy();
        });

        it('should return true for Firefox for Maemo (Nokia N900)', function() {
            var ua = 'Mozilla/5.0 (Maemo; Linux armv7l; rv:10.0.1) Gecko/20100101 Firefox/10.0.1 Fennec/10.0.1';
            var result = InfoBar.prototype.isFirefoxMobile(ua);
            expect(result).toBeTruthy();
        });
    });

    describe('InfoBar.prototype.isFirefox', function() {
        it('should consider Firefox to be Firefox', function() {
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20100101 Firefox/23.0';
            var result = InfoBar.prototype.isFirefox(ua);
            expect(result).toBeTruthy();
        });

        it('should not consider Camino to be Firefox', function() {
            var ua = 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10.4; en; rv:1.9.2.24) Gecko/20111114 Camino/2.1 (like Firefox/3.6.24)';
            var result = InfoBar.prototype.isFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it('should not consider Chrome to be Firefox', function() {
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.57 Safari/537.36';
            var result = InfoBar.prototype.isFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it('should not consider Safari to be Firefox', function() {
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2';
            var result = InfoBar.prototype.isFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it('should not consider IE to be Firefox', function() {
            var ua = 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)';
            var result = InfoBar.prototype.isFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it('should not consider SeaMonkey to be Firefox', function() {
            var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:25.0) Gecko/20100101 Firefox/25.0 SeaMonkey/2.22.1';
            var result = InfoBar.prototype.isFirefox(ua);
            expect(result).not.toBeTruthy();
        });

        it('should not consider Iceweasel to be Firefox', function() {
            var ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:17.0) Gecko/20121202 Firefox/17.0 Iceweasel/17.0.1';
            var result = InfoBar.prototype.isFirefox(ua);
            expect(result).not.toBeTruthy();
        });
    });
});
