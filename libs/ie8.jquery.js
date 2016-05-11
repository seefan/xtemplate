/**
 * 使用jQuery来兼容ie8以下
 */
(function (r, undefined) {
    'use strict';
    if (!document.querySelectorAll) {
        r.querySelectorAll  = function (q) {
            var item = $(q), re = [];
            item.each(function (i, e) {
                re.push(e);
            });
            return re;
        }
    }
    /*
     * String ES5 extend
     */
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }
})(window.Render.util);