(function (w, u) {
    'use strict';
    /**
     * 在指定对象平级附加一个对象
     * @param newEl
     * @param targetEl
     */
    u.insertAfter = function (newEl, targetEl) {
        var parentEl = targetEl.parentNode;
        if (!parentEl) {
            return;
        }
        if (parentEl.lastChild === targetEl) {
            parentEl.appendChild(newEl);
        } else {
            parentEl.insertBefore(newEl, targetEl.nextSibling);
        }
    };
    /**
     * 取下一个节点
     * @param ele
     * @returns {*}
     */
    u.getNextSibling = function (ele) {
        if (ele.nextElementSibling && ele.nextElementSibling.tagName == ele.tagName) {
            return ele.nextElementSibling;
        } else {
            return false;
        }
    };
    /**
     * 清理代码
     * @param val
     */
    u.trim = function (val) {
        if (typeof(val) == 'string') {
            return val.replace(/\r/g, '').replace(/\n/g, '').replace('　', '').trim();
        } else {
            return u.trim(u.getStringValue(val));
        }
    };
    /**
     * 给指定对象设置值
     * @param ele
     * @param value
     */
    u.setValue = function (ele, value) {
        var tag = ele.tagName;
        var id = ele.attributes['data-bind-to'];
        if (id) {
            ele[id.value] = value;
        } else {
            switch (tag) {
                case 'IMG':
                    ele.src = value;
                    break;
                case 'INPUT':
                    ele.value = value;
                    break;
                default:
                    ele.innerHTML = value;
                    break;
            }
        }
    };

    /**
     * 过滤html
     * @param html
     * @returns {string}
     */
    u.html = function (html) {
        if (html && typeof(html) == 'string') {
            html = html.replace(/<[^<]*>/gi,'');
            return html.trim();
        } else {
            return this.getStringValue(html);
        }
    };
    /**
     * 取数组的key全集
     * @param key
     * @param data
     * @returns {*}
     */
    u.getName = function (key, data) {
        var value = data[key];
        var type = typeof value;
        if (type == 'string' || type == 'number') {
            return [key];
        } else {
            var names = [];
            for (var k in value) {
                var tkv = this.getName(k, value);
                for (var i = 0; i < tkv.length; i++) {
                    names.push(key + '.' + tkv[i]);
                }
            }
            return names;
        }
    };
    /**
     * 是否有指定串开头
     * @param str
     * @param startString
     */
    u.startWith = function (str, startString) {
        if (str && startString && str.length > startString.length && str.substr(0, startString.length) == startString) {
            return true;
        } else {
            return false;
        }
    };
    /**
     * 是否为数字
     * @param chars
     * @returns {boolean}
     */
    u.isNumber = function (chars) {
        var re = /^(-?\d+)(\.\d+)?/;
        return chars.match(re) !== null;
    };

    /**
     * 取指定数组的值
     * @param key
     * @param data
     * @returns {*}
     */
    u.getValue = function (key, data) {
        var keys = key.split('.'), result = data[keys.shift()];
        for (var i = 0; result && i < keys.length; i++) {
            result = result[keys[i]];
        }
        return this.getStringValue(result);
    };
    /**
     * 取默认显示的值
     * @param val
     * @returns {*}
     */
    u.getStringValue = function (val) {
        if (val === null || typeof val == 'undefined') {
            return '';
        } else {
            return val.toString();
        }
    };
    /**
     * 转向一个url，支持多个参数，第一个参数为url地址，后续为参数
     */
    u.gotoUrl = function () {
        var url = '', i = 0;
        if (arguments.length > 0) {
            url = arguments[i];
        }
        if (url.indexOf('?') != -1) {
            url += '&';
        } else {
            url += '?';
        }
        for (i = 1; i < arguments.length - 1; i += 2) {
            url += arguments[i] + '=' + encodeURIComponent(arguments[i + 1]) + '&';
        }
        w.location.href = url;
    };
    /**
     * 取url的参数
     * @returns {{}}
     */
    u.getUrlQuery = function () {
        var args = {};

        var query = w.location.search;//获取查询串
        if (query && query.length > 1) {
            query = query.substring(1);
            var pos = query.indexOf('#');
            if (pos != -1) {
                query = query.substring(0, pos);
            }
            var pairs = query.split("&");
            for (var i = 0; i < pairs.length; i++) {
                pos = pairs[i].indexOf('=');//查找name=value
                if (pos == -1) {
                    continue;
                }
                //如果没有找到就跳过
                var argname = pairs[i].substring(0, pos);//提取name
                if (!argname) {
                    continue;
                }
                var value = pairs[i].substring(pos + 1);//提取value
                if (!value) {
                    continue;
                }
                args[argname] = decodeURIComponent(value);//存为属性
            }
        }
        return args;
    };
})(window, window.Render.util);