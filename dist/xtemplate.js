(function (document, r) {
    'use strict';
    //全局变量
    r.$scope = {};
    //可绑定的key列表
    r.$bindKey = {};
    //缓存
    r.cache = {};
    //内部函数
    r.funcs = {};
    //工具
    r.util = {};
    /**
     * 绑定数据值
     * @param id 缓存范围的id
     * @param data 要绑定的数据
     */
    r.bindData = function (data, name) {
        if (!name) {
            name = 'data';
        }
        this.$scope[name] = data;
        this.$bindKey[name] = [];
        var i = 0;
        for (var tkey in data) {
            var k = this.util.getName(tkey, data);
            for (i = 0; i < k.length; i++) {
                this.$bindKey[name].push(k[i]);
            }
        }

        for (var j = 0; j < this.$bindKey[name].length; j++) {
            var key = this.$bindKey[name][j], item = this.$scope[name];
            if (name != 'data') {
                key = name + '.' + key;
                item = this.$scope;
            }
            var items = document.getElementsByName(key);
            for (i = 0; i < items.length; i++) {
                var xf = this.cache['xdf-bind-' + key], value;
                if (xf) {
                    value = xf(this, item);
                } else {
                    //如果简单的绑定innerHTML,就不再转为纯文本了
                    var id = items[i].attributes['data-bind-to'];
                    if (id && id.value == 'innerHTML') {
                        value = this.util.getValue(key, item);
                    } else {
                        value = this.util.html(this.util.getValue(key, item));
                    }
                }
                this.util.setValue(items[i], value);
            }
        }
    };
    /**
     * 重新给某个对象绑定新的值
     * @param name
     * @param value
     */
    r.bindName = function (name, value) {
        var items = document.getElementsByName(name);
        if (items) {
            //this.$scope[name] = value;
            for (var i = 0; i < items.length; i++) {
                this.util.setValue(items[i], value);
                items[i].style.display = '';
            }
        }
    };
    /**
     * 循环绑定数据值
     * @param id 缓存范围的id
     * @param data 要绑定的数据
     */
    r.bindRepeatData = function (data, id) {
        var item = this.cache['xd-repeat-' + id];
        if (!item) {
            return;
        }
        if (!data || data.length < 1) {
            return;
        }
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var func = this.cache['xdf-repeat-' + id];
            if (func) {
                html += func(this, data[i]);
            }
        }
        item.innerHTML = html;
    };


    /**
     * 增加自定义函数
     * @param func
     * @param name
     */
    r.addFunc = function (func, name) {
        if (func && name) {
            this.funcs[name] = func;
        }
    };
})(document, window.Render = {});;(function (w, u) {
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
    }
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
            html = html.replace(/</g, '&lt;');    //置换符号<
            html = html.replace(/>/g, '&gt;');    //置换符号>
            return html;
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
        if (val == null || typeof val == 'undefined') {
            return '';
        } else {
            return val.toString();
        }
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
})(window, window.Render.util);;(function (r) {

    /**
     * 处理绑定函数
     * @param item
     * @param cache
     */
    function initBind(item, cache) {
        var id = item.attributes['data-bind-to'];
        if (id && item.attributes.name) {
            var name = item.attributes.name.value;
            var tpl = r.util.trim(item[id.value]);
            if (tpl.length > 0) {
                var funcBody = 'var $scope=my.$scope;return ' + runTemplate(item[id.value]) + ';';
                item[id.value] = '';
                try {
                    /* jshint ignore:start */
                    cache['xdf-bind-' + name] = new Function('my', 'vo', funcBody);
                    /* jshint ignore:end */
                    return true;
                } catch (e) {
                    console.log('解析bind模板' + id.value + '出错，' + e.message);
                }
            }
        }
        return false;
    }

    /**
     * 处理循环
     * @param item
     */
    function initRepeat(item) {
        var id = item.attributes['data-repeat-name'];
        if (id) {
            r.initRepeat(item, id.value);
        }
    }


    /**
     * 将数据与模块绑定
     * @param tmpl
     * @param data
     * @returns {XML|string|void}
     */
    function runTemplate(tmpl) {
        var i = 0, start = 0, end = 0, word, result = [];
        while (i < tmpl.length) {
            start = tmpl.indexOf('{', i);
            if (start !== -1) {
                end = tmpl.indexOf('}', start + 1);
                if (end === -1) {
                    end = tmpl.length;
                }
                word = tmpl.substring(start + 1, end).trim();
                result.push(runText(tmpl.substring(i, start)));
                if (word !== '') {
                    result.push(runKeyword(word));
                }
            } else {
                result.push(runText(tmpl.substring(i)));
                end = tmpl.length;
            }
            i = end + 1;
        }
        return result.join('+');
    }

    /**
     * 处理字符串
     * @param text
     */
    function runText(text) {
        if (typeof(text) == 'string') {
            return '"' + text.replace(/\"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace('data-bind-src', 'src') + '"';
        } else {
            return r.util.getStringValue(text);
        }
    }

    /**
     * 处理函数
     * @param funcString
     * @param val
     * @returns {*}
     */
    function runKeyword(funcString) {
        var filterHtml = true;
        if (funcString[0] == '#') {
            funcString = funcString.substring(1);
            filterHtml = false;
        }
        var f = funcString.split('|');
        if (f.length > 0) {
            if (filterHtml) {
                return 'Render.util.html(' + runFuncString(f, f.length - 1) + ')';
            } else {
                return runFuncString(f, f.length - 1);
            }
        }
        return '""';
    }


    /**
     * 组合出函数结构
     * @param funcs
     * @param i
     * @returns {*}
     */
    function runFuncString(funcs, i) {
        if (i > 0) {
            var funcArray = funcs[i].split(',');
            if (funcArray.length > 0) {
                var funcName = funcArray[0];
                funcArray[0] = runFuncString(funcs, i - 1);
                return runFunc(funcName) + '(' + funcArray.join(',') + ')';
            }
        } else {
            return runValue(funcs[0]);
        }
        return '';
    }

    /**
     * 取存在有函数名
     * @param funcName
     * @returns {string}
     */
    function runFunc(funcName) {
        if (r.funcs[funcName]) {
            return 'my.funcs.' + funcName;
        } else {
            return 'my.funcs.noFunc';
        }
    }

    /**
     * 处理关键字
     * 有几类数据
     * 1、数字，可以以-.开头
     * 2、$scope.全局变量
     * 3、循环变量
     * 4、以"或'包围的字符串
     * @param word
     */
    function runValue(word) {
        var val = '';
        if (word.length > 0) {
            var words = splitWord(word);
            for (var i = 0; i < words.length; i++) {
                switch (words[i][0]) {
                    case '+':
                    case "-":
                    case '*':
                    case '/':
                    case '(':
                    case ')':
                    case '$':
                    case "'":
                    case '"':
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        val += words[i];
                        break;
                    default :
                        val += "my.util.getValue('" + words[i] + "',vo)";
                        break;
                }
            }
        }
        return val === '' ? "''" : val;
    }

    /**
     * 拆分单词
     * @param word
     * @returns {Array}
     */
    function splitWord(word) {
        var arr = [], start = 0, end = 0, key, pop = 0;
        for (var i = 0; i < word.length; i++) {
            switch (word[i]) {
                case '+':
                case '-':
                case '*':
                case '/':
                    if (i > start) {
                        key = word.substring(start, i);
                        if (key.trim() !== '') {
                            arr.push(key.trim());
                        }
                    }
                    arr.push(word[i]);
                    start = i + 1;
                    break;
                case '(':
                case ')':
                    arr.push(word[i]);
                    start = i;
                    break;
                case '"':
                case "'":
                    if (i > start) {
                        key = word.substring(start, i);
                        if (key.trim() !== '') {
                            arr.push(key.trim());
                        }
                    }
                    end = getEnd(word, i);
                    if (end > 0) {
                        arr.push(word.substring(i, end + 1));
                        i = end;
                        start = i + 1;
                    }
                    break;
            }

        }
        if (word.length > start) {
            key = word.substring(start, word.length);
            if (key.trim() !== '') {
                arr.push(key.trim());
            }
        }
        return arr;
    }

    /**
     * 根据单词开始取结尾
     * @param word
     * @param i
     * @returns {*}
     */
    function getEnd(word, i) {
        for (var j = i + 1; j < word.length; j++) {
            if (word[j] == word[i]) {
                return j;
            }
        }
        return 0;
    }

    /**
     * 初始化语法结构
     * @param items 渲染器的有效范围
     */
    r.init = function (items) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (!initBind(item, r.cache)) {
                initRepeat(item);
            }
        }
    };

    /**
     * 处理循环
     * @param item
     * @param id
     */
    r.initRepeat = function (item, id) {
        this.cache['xd-repeat-' + id] = item;
        var html = item.innerHTML;
        item.innerHTML = '';
        var f = this.cache['xdf-repeat-' + id];
        if (f) {
            return true;
        }
        var funcBody = 'var $scope=my.$scope;return ' + runTemplate(html) + ';';
        try {
            /* jshint ignore:start */
            f = new Function('my', 'vo', funcBody)
            /* jshint ignore:end */
        } catch (e) {
            f = function () {
            };
            console.log('解析repeat模板' + id + '出错，' + e.message);
        }
        this.cache['xdf-repeat-' + id] = f;
        return f;
    };

})(window.Render);;(function (f) {
    'use strict';
    /**
     * 默认值
     * @param val
     * @param defaultVal
     * @returns {*}
     */
    f.default = function (val, defaultVal) {
        if (!val && defaultVal) {
            return defaultVal;
        }
        return val;
    };
    /**
     * 按值选择返回内容
     * @param val
     * @returns {*}
     */
    f.case = function (val) {
        for (var i = 1; i < arguments.length; i += 2) {
            if (val == arguments[i] && i < arguments.length - 1) {
                return arguments[i + 1];
            }
        }
        return arguments[arguments.length - 1];
    };
    /**
     * 格式化货币
     * @param val
     * @returns {Number}
     */
    f.format_currency = function (val) {
        return parseFloat(val);
    };


    /**
     * 将 Date 转化为指定格式的String
     * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
     * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     * 例子：
     * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
     * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
     * @param val
     * @param fmt
     */
    f.format_date = function (val, fmt) {
        if (typeof(val) != 'object') {
            val = new Date(parseInt(val));
        }
        if (!fmt) {
            fmt = 'yyyy-MM-dd hh:mm:ss';
        }
        var format_data_o = {
            "M+": val.getMonth() + 1,                 //月份
            "d+": val.getDate(),                    //日
            "h+": val.getHours(),                   //小时
            "m+": val.getMinutes(),                 //分
            "s+": val.getSeconds(),                 //秒
            "q+": Math.floor((val.getMonth() + 3) / 3), //季度
            "S": val.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (val.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in format_data_o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (format_data_o[k]) : (("00" + format_data_o[k]).substr(("" + format_data_o[k]).length)));
        return fmt;

    };
    /**
     * 数字保留小数位数
     * @param num
     * @param c
     * @returns {string}
     */
    f.fixed = function (num, c) {
        if (num) {
            return num.toFixed(c);
        } else {
            return '';
        }
    };
    /**
     * 没有正确的函数处理时，用此函数处理
     * @param val
     * @returns {*}
     */
    f.noFunc = function (val) {
        return val;
    };
    /**
     * 重复num次val
     *
     * @param num
     * @param val
     * @returns {string}
     */
    f.repeat = function (num, val) {
        var result = '';
        for (var i = 0; i < num; i++) {
            result += val;
        }
        return result;
    };
})(window.Render.funcs);;(function (d, w, x) {
    'use strict';
    var r = w.Render;
    x.isInit = false;
    x.optAjax = false;
    x.ready = function (callback, reload) {
        if (!x.isInit) {
            if (typeof callback === 'function') {
                x.callback = callback;
            }
        } else {
            if (reload) {
                r.init(document.all);
            }
            callback();
        }
    };
    x.init = function () {
        if (r) {
            r.init(d.all);
            x.isInit = true;
            if (x.callback) {
                x.callback();
            }
        }
    };
    //参数
    x.query = function (key) {
        if (!w.query_args) {
            w.query_args = r.util.getUrlQuery();
        }
        return w.query_args[key];
    };
    /**
     * 加载数据
     * @param id
     * @param postUrl
     * @param param
     * @param callback
     * @param errorback
     */
    x.load = function (id, postUrl, param, backdata, callback, errorback) {
        var opt = {};
        opt.url = postUrl;
        opt.data = param;
        if (errorback) {
            opt.error = errorback;
        } else if (x.error_callback) {
            opt.error = x.error_callback;
        }

        opt.success = function (data) {
            if (x.checkData) {
                if (!x.checkData(data)) {
                    return;
                }
            }
            if (backdata) {
                data = backdata(data);
                if (!data) {
                    return;
                }
            }
            if (toString.apply(data) == "[object Array]") {
                r.bindRepeatData(data, id);
            } else {
                if (id) {
                    r.bindData(data, id);
                } else {
                    r.bindData(data);
                }
            }
            if (callback) {
                callback(data);
            }
        };
        if (x.isInit) {
            if (x.optAjax) {
                x.optAjax.ajax(opt);
            } else {
                $.ajax(opt);
            }
        }
    };
    /**
     * 设置ajax类，默认为jquery
     * @param ajax
     */
    x.setAjax = function (ajax) {
        this.optAjax = ajax;
    };
    if (d.readyState === 'complete') {
        x.init();
    } else {
        d.onreadystatechange = function () {
            if (d.readyState === 'complete') {
                x.init();
            }
        };
    }
})(document, window, window.XTemplate = {});