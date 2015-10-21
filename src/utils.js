(function (w, u) {
    'use strict';
    /**
     * 清理代码
     * @param val
     */
    u.trim = function (val) {
        if (typeof(val) == 'string') {
            return val.replace(/\r/g, '').replace(/\n/g, '').replace('　', '').trim();
        } else {
            return u.trim(u.getDefaultValue(val));
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
            html = html.replace(/<[^<]*>/gi, '');
            return html.trim();
        } else {
            return this.getDefaultValue(html);
        }
    };
    /**
     * 判断变量是否为数组
     * @param val
     * @returns {boolean}
     */
    u.isArray = function (val) {
        return toString.apply(val) === "[object Array]";
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
        switch (type) {
            case 'string':
            case 'number':
            case 'boolean':
                return [key];
            case 'object':
                if (this.isArray(value)) {
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
                break;
            default:
                return [];
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
        //
        return this.getDefaultValue(result);
    };
    /**
     * 取值
     * 支持两种数据，简单变量和数组，如果为null或是undefined，自动转为空串
     * @param val
     * @returns {*}
     */
    u.getDefaultValue = function (val) {
        if (val === null || typeof val == 'undefined') {
            return '';
        } else {
            return val;
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
     * 显示一个对象
     * 设置style.display=''，同时去掉class中名为hide样式
     * @param ele
     */
    u.show = function (ele) {
        if (ele) {
            if (ele.style.display == 'none') {
                ele.style.display = '';
            }
            if (ele.classList.contains('hide')) {
                ele.classList.remove('hide');
            }
        }
    };
    /**
     * 取url的所有参数
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