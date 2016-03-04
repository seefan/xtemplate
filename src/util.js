/**
 * 常用工具方法集合
 * @class Render.util
 */
(function (w, u) {
    'use strict';
    /**
     * 清理代码，主要是清理掉换行和空格
     *
     * @method trim
     * @param val {string} 要清理的内容
     */
    u.trim = function (val) {
        if (typeof(val) == 'string') {
            return val.replace(/\r/g, '').replace(/\n/g, '').replace('　', '').trim();
        } else if (u.isPlainObject(val)) {
            return u.trim(u.getDefaultValue(val));
        } else {
            return String.valueOf(val);
        }
    };
    /**
     * 是否是一个简单的对象
     * @method isPlainObject
     * @param value 目标对象
     * @returns {boolean}
     */
    u.isPlainObject = function (value) {
        return !!value && Object.prototype.toString.call(value) === '[object Object]';
    };

    /**
     * 给指定html网页中对象设置值，目前对img设置src，input设置value，其它设置innerHTML。
     * 此方法内部用。
     *
     * @param ele 对象实例
     * @param value 值
     */
    u.setValue = function (ele, value) {
        var tag = ele.tagName, i = 0;
        var bs = this.getBindToNameList(ele);
        if (bs.length > 0) {
            for (i in bs) {
                var attrName = bs[i];
                if (ele.attributes[attrName]) {
                    ele.setAttribute(attrName, value);
                } else {
                    ele[attrName] = value;
                }
            }
        } else {
            switch (tag) {
                case 'IMG':
                    ele.src = value;
                    break;
                case 'INPUT':
                    ele.value = value;
                    break;
                case 'SELECT':
                    for (i = 0; i < ele.options.length; i++) {
                        if (ele.options[i].value == value) {
                            ele.options[i].selected = true;
                            break;
                        }
                    }
                    break;
                default:
                    ele.innerHTML = value;
                    break;
            }
        }
    };

    /**
     * 过滤html，清理掉所有的html标签和换行空格
     *
     * @param html {string}
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
     *
     * @param val 要判断的变量
     * @returns {boolean} 是否为数组
     */
    //u.isArray = function (val) {
    //    return toString.apply(val) === "[object Array]";
    //};
    u.isArray = Array.isArray || function (object) {
        return object instanceof Array;
    };
    /**
     * 取数组的key全集，内部使用
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
                if (u.isArray(value)) {
                    return [key];
                } else {
                    var names = [];
                    for (var k in value) {
                        //跳过非属性
                        if (value[k]) {
                            var tkv = u.getName(k, value);
                            for (var i = 0; i < tkv.length; i++) {
                                names.push(key + '.' + tkv[i]);
                            }
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
     *
     * 示例：
     *
     *     startWith('abcdedfs','ab')   输出 true
     *
     * @method startWith
     * @param str {string} 待检查的串
     * @param startString 指定串
     * @returns {boolean}
     */
    u.startWith = function (str, startString) {
        if (str && startString && str.length > startString.length && str.substr(0, startString.length) == startString) {
            return true;
        } else {
            return false;
        }
    };
    /**
     * 使用正则表示式判断是否为数字格式
     *
     * @method isNumber
     * @param chars {string}待判断有串
     * @returns {boolean}
     */
    u.isNumber = function (chars) {
        var re = /^(-?\d+)(\.\d+)?/;
        return chars.match(re) !== null;
    };

    /**
     * 取指定数组的值，内部用
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
     * 取值，支持两种数据，简单变量和数组，如果为null或是undefined，自动转为空串。内部用
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
     *
     * 示例：
     *
     *     gotoUrl('index.html','id',1) 跳转到 index.html?id=1
     *     gotoUrl('index.html?id=1','k','news','c','show') 跳转到 index.html?id=1&k=news&c=show
     *
     * @method gotoUrl
     * @param url {string} 要跳转的url地址
     * @param ... 多个自由参数，2个一组，第1个为参数名，第2个为值。
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
     * 取绑定名列表，多个绑定名用空格分开，内部用
     * @param item 目标
     * @returns {Array} 返回绑定名列表
     */
    u.getBindToNameList = function (item) {
        var binds = item.attributes['data-bind-to'];
        var re = [];
        if (binds && binds.value) {
            var sps = binds.value.split(' ');
            var tmp, i = 0;
            for (; i < sps.length; i++) {
                tmp = u.trim(sps[i]);
                if (tmp !== '') {
                    re.push(tmp);
                }
            }
        }
        return re;
    };
    /**
     * 显示一个对象
     * 设置style.display=''，同时去掉class中名为hide样式
     *
     * @method show
     * @param ele 要显示的对象实例
     * @param isTrue 是否显示，默认为true
     */
    u.show = function (ele, isTrue) {
        if (ele) {
            if (isTrue !== false) {
                if (ele.style.display == 'none') {
                    ele.style.display = '';
                }
                u.removeClass(ele,'hide');
            } else {
                ele.style.display = 'none';
            }
        }
    };
    /**
     * 增加一个class
     * @method setValue
     * @param ele
     * @param className
     */
    u.addClass = function (ele, className) {
        if (ele.classList) {
            if (!ele.classList.contains(className)) {
                ele.classList.add(className);
            }
        } else {
            var css = ele.className;
            if (css) {
                var csss = css.split(' '), exists = false;
                for (var i = 0; i < csss.length; i++) {
                    if (csss[i] == className) {
                        exists = true;
                    }
                }
                if (!exists) {
                    csss.push(className);
                }
                css = csss.join(' ');
            } else {
                css = className;
            }
            ele.className = css;
        }
    };
    /**
     * 删除一个class
     * @method setValue
     * @param ele
     * @param className
     */
    u.removeClass = function (ele, className) {
        if (ele.classList) {
            if (ele.classList.contains(className)) {
                ele.classList.remove(className);
            }
        } else {
            var css = ele.className;
            if (css) {
                var csss = css.split(' ');
                css = '';
                for (var i = 0; i < csss.length; i++) {
                    if (csss[i] != className) {
                        css += csss[i];
                    }
                }
                ele.className = css;
            }
        }
    };
    /**
     * 取url的所有参数
     * @method getUrlQuery
     * @returns {object}
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