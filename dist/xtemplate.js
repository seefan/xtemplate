/**
 * XTemplate的运行主体，使用对外使用的变量有$scope，当使用bindData时，数量会按名字注入这个变量。
 *
 * 目前支持两种形式的绑定，单变量绑定和数组。
 * 单变量绑定是以html中name名字为绑定对象，只要名字和绑定的变量同名，即会自动赋值。
 *
 * 例如：<p name='title'></p>
 * 这时如果有一个变量为如下结构{title:'hello world'}，那么，这个name为title的p标签就会显示hello world。
 * 最终会生成
 * <p name='title'>hello world</p>
 * 数组绑定是首先取到一个模板，再把一个数组的内容循环，按模板格式化后返回多行html。
 * 例如：<ul data-repeat-name='listdata'>
 *          <li>{title}</li>
 *      </ul>
 * 这里定义了一个名为listdata的模板，ul的内部html将成为可循环的模板，即<li>{title}</li>为待循环的内容
 * 我们绑定以下变量[{title:'hello 0'},{title:'hello 1'}]
 * 最终会生成
 * <ul data-repeat-name='listdata'>
 *          <li>hello 0</li>
 *          <li>hello 1</li>
 *      </ul>
 *
 * 特殊语法：
 * #号的使用
 * 在模板中使用，例如{#title}，输出title的值，以没有#的区别，这里不会把html进行编码，会输出原始的html。
 * 在函数名中使用，如果在函数名前加#，则指定这个函数为全局函数，这时这个函数必须是已经定义的好的全局函数或是javascript的内部函数。
 *
 * data-bind-src，主要是给img标签用，作用是将src的值组装好后再绑定，这里避免无效的src。
 * 例如：<img src='/{imgsrc}/abc.jpg'>这个src是无效的，但浏览器会加载这个错误的地址引起一次无效的http请求。
 * 正确的做法是<img data-bind-src='/imgsrc/abc.jsp'>或<img data-bind-src='/imgsrc/abc.jsp' src='默认图'>
 *
 * data-bind-to，是指定绑定的属性名称，同时可以使用模板。
 * 例如：<a name='product_id' data-bind-to='href' href='/news/{product_type}/{product_id}/detail.html'>click</a>
 * 在使用bindData时，会将href的内容格式化后重新替换href，以生成一个新的href。
 * 特殊用法，$scope的使用
 * <a name='product_id' data-bind-to='href' href='/news/{$scope.type}/{product_id}/detail.html'>click</a>
 * 如果$scope中有type属性，该值会被带入。
 * 如果其它模板中有与{$scope.type}冲突的，以至于我们取不到正确的模板，那么在前面加一个#来解决
 * {#$scope.type}
 *
 * 函数的使用
 * 目前已经支持了default,case等多个函数。
 * 输出html转义值: {title}
 * 直接输出原始值: {!title}
 * 模板内使用外部变量: {#title}，使用$scope{#$scope.title}，输出$scope的原始值{#!$scope.title}
 * 使用函数处理: {title|default,'空标签'}
 * 多个函数可连续使用: {title|default,'空标签'|left,10}，title输出值默认为空标签，最多输出10个字符
 */
(function (w, doc, r) {
    'use strict';
    //全局变量
    w.$scope = {};
    //可绑定的key列表
    r.$bindKey = {};

    //语法处理
    r.syntax = {};
    //内部函数
    r.funcs = {};
    //工具
    r.util = {};


    /**
     * 绑定数据值
     * @param data 要绑定的数据
     * @param name 绑定对象的名称，默认为data
     * 当未指定名称时，在绑定时直接使用属性名，例：{key:'key1'}，绑定时只需key即可
     * 当指定名称时，在绑定时需要在属性名前加上指定的名称，例：{key:'key1'}，名称为data1,绑定时需data1.key
     */
    r.bindData = function (data, name) {
        if (!name) {
            name = 'data';
        }
        w.$scope[name] = data;
        this.$bindKey[name] = [];
        var i = 0;
        for (var tkey in data) {
            var k = this.util.getName(tkey, data);
            for (i = 0; i < k.length; i++) {
                this.$bindKey[name].push(k[i]);
            }
        }

        for (var j = 0; j < this.$bindKey[name].length; j++) {
            var key = this.$bindKey[name][j], item = w.$scope[name];
            if (name != 'data') {
                key = name + '.' + key;
                item = w.$scope;
            }
            var items = doc.getElementsByName(key);
            var value;
            for (i = 0; i < items.length; i++) {
                value = '';
                var id = items[i].attributes['data-bind-to'];
                if (id) {
                    var xf = r.syntax.buildFunc(key, items[i][id.value]);
                    if (xf) {
                        value = xf(this, item);
                    } else {
                        //如果简单的绑定innerHTML,就不再转为纯文本了
                        if (id.value === 'innerHTML') {
                            value = this.util.getValue(key, item);
                        } else {
                            value = this.util.html(this.util.getValue(key, item));
                        }
                    }
                } else {
                    //单独处理一下img的data-bind-src
                    id = items[i].attributes['data-bind-src'];
                    if (id) {
                        var xff = r.syntax.buildFunc(key, id.value);
                        if (xff) {
                            value = xff(this, item);
                        } else {
                            value = this.util.getValue(key, item);//不需要html转义
                        }
                    } else {
                        value = this.util.html(this.util.getValue(key, item));
                    }
                }

                this.util.setValue(items[i], value);
                items[i].style.display = '';
            }
        }
    };
    /**
     * 重新给某个对象绑定新的值，这个值不会被缓存
     * @param name
     * @param value
     */
    r.bindName = function (name, value) {
        var items = doc.getElementsByName(name);
        if (items) {
            for (var i = 0; i < items.length; i++) {
                this.util.setValue(items[i], value);
                items[i].style.display = '';
            }
        }
    };
    /**
     * 循环绑定数据值,默认id为data
     * @param data 要绑定的数据
     * @param name 缓存范围的id，默认为data
     */
    r.bindRepeatData = function (data, name) {
        if (!data || data.length < 1) {
            return;
        }
        if(!name){
            name='data';
        }
        var func = this.syntax.cacheRepeatFunc(name);
        if (func) {
            var html = '';
            for (var i = 0; i < data.length; i++) {
                html += func(this, data[i]);
            }
            r.syntax.setRepeatHtml(name, html);
        }
    };


    /**
     * 如果需要自行扩展Render的函数，请使用本函数。
     * 这些函数可以在html的模板中使用
     * 增加自定义函数
     * @param func 函数体
     * @param name 函数的名称
     */
    r.addFunc = function (func, name) {
        if (func && name) {
            this.funcs[name] = func;
        }
    };
})
(window, document, window.Render = {});;(function (w, u) {
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
        switch(type){
            case 'string':
            case 'number':
            case 'boolean':
                return [key];
            case 'object':
                var names = [];
                for (var k in value) {
                    var tkv = this.getName(k, value);
                    for (var i = 0; i < tkv.length; i++) {
                        names.push(key + '.' + tkv[i]);
                    }
                }
                return names;
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
})(window, window.Render.util);;/**
 * XTemplate 的语法定义
 *
 *
 */
(function (r) {
    /**
     * 将数据与模块绑定
     * @param tmpl
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
     * 处理函数关键字
     * @param funcString
     * @returns {*}
     */
    function runKeyword(funcString) {
        var filterHtml = true;
        if (funcString[0] == '!') {
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
        if (funcName && funcName.length > 1 && funcName[0] == '#') {
            return funcName.substring(1);
        } else if (r.funcs[funcName]) {
            return 'my.funcs.' + funcName;
        } else {
            return 'my.funcs.noFunc';
        }
    }

    /**
     * 处理关键字
     * 有几类数据
     * 1、数字，可以以-.开头
     * 2、#开头的为全局变量
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
                    case '#'://外部变量
                        val += words[i].substring(1);
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

    //语法缓存
    r.syntax.cache = {};
    /**
     * 返回绑定函数
     * @param name
     * @param html
     * @returns {*}
     */
    r.syntax.buildFunc = function (name, html) {
        var tpl = r.util.trim(decodeURIComponent(html));
        if (tpl.length > 0) {
            var funcBody = 'return ' + runTemplate(tpl) + ';';
            try {
                /* jshint ignore:start */
                return new Function('my', 'vo', funcBody);
                /* jshint ignore:end */
            } catch (e) {
                console.log('解析bind模板' + name + '出错，' + e.message);
            }
        }
        return false;
    };
    /**
     * 初始化语法结构
     * @param items 渲染器的有效范围
     */
    r.init = function (items) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var id = item.attributes['data-repeat-name'];
            if (id) {
                r.syntax.initRepeat(item, id.value);
            }
        }
    };
    /**
     * 返回有缓存的方法
     * @param id
     * @returns {*}
     */
    r.syntax.cacheRepeatFunc = function (id) {
        var f = this.cache['xdf-repeat-' + id];
        if (f) {
            return f;
        } else {
            return false;
        }
    };
    /**
     * 处理循环
     * @param item
     * @param id
     */
    r.syntax.initRepeat = function (item, id) {
        var html = item.innerHTML;
        if (this.cache['xd-repeat-' + id] != item) {
            this.cache['xd-repeat-' + id] = item;
            item.innerHTML = '';
        }
        var f = this.cache['xdf-repeat-' + id];
        if (f) {
            return;
        }
        f = r.syntax.buildFunc(id, html);
        if (!f) {
            f = function () {
            };
        }
        this.cache['xdf-repeat-' + id] = f;
    };
    /**
     * 给缓存的对象设置值
     * @param id
     * @param html
     */
    r.syntax.setRepeatHtml = function (id, html) {
        var item = this.cache['xd-repeat-' + id];
        if (item) {
            item.innerHTML = html;
            item.style.display='';
        }
    };
})(window.Render);;/**
 * XTemplate 所有的扩展函数集合，用于处理html中常见的格式转换，默认值等处理。
 *
 * 如果需要自行扩展，请使用window.Render的addFunc函数
 */
(function (f, util) {
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
    /**
     * 过滤html字符
     * @param html
     * @returns {string|*}
     */
    f.filter_html = function (html) {
        return util.html(html);
    };
    /**
     * 从左侧截断字串
     * @param str
     * @param len 截断后的字串长度，一个汉字按2个字符计算
     * @param dot 可选，截断后补充的串，示例:"..."
     * @returns {string}
     */
    f.left = function (str, len, dot) {
        var newLength = 0;
        var newStr = "";
        var chineseRegex = /[^\x00-\xff]/g;
        var singleChar = "";
        var dotLen = 0;
        if (dot) {
            dotLen = dot.length;
        }
        var strLength = str.replace(chineseRegex, "**").length;
        for (var i = 0; i < strLength; i++) {
            singleChar = str.charAt(i).toString();
            if (singleChar.match(chineseRegex) !== null) {
                newLength += 2;
            } else {
                newLength++;
            }
            if (newLength + dotLen > len) {
                if (dotLen > 0) {
                    newStr += dot;
                }
                break;
            }
            newStr += singleChar;
        }
        return newStr;
    };
})(window.Render.funcs, window.Render.util);;(function (d, w, x) {
    'use strict';
    var r = w.Render;
    //是否已初始化
    x.isInit = false;
    //是否使用其它的ajax方法，默认使用jquery
    x.optAjax = false;
    //准备方法，XTemplate的入口方法，XTemplate准备好后将执行这个方法，以便自动执行一些绑定函数等。
    x.ready = function (callback, reload) {
        if (!x.isInit) {
            if (typeof callback === 'function') {
                x.callback = callback;
            }
        } else {
            if (reload) {
                r.init(document.all);
            }
            if (typeof callback === 'function') {
                x.callback = callback;
                x.callback();
            }
        }
    };
    //初始化
    x.init = function () {
        if (r) {
            r.init(d.all);
            x.isInit = true;
            if (x.callback) {
                x.callback();
            }
        }
    };
    /**
    * 取url的参数，并可以指定默认值
    * @param key 参数名
    * @oaram defaultValue 默认值，可选
    */
    x.query = function (key,defaultValue) {
        if (!w.query_args) {
            w.query_args = r.util.getUrlQuery();
        }
        var tmp= w.query_args[key];
        if(!tmp){
            return defaultValue;
        }
    };
    //绑定工具
    x.util = r.util;
    /**
     * 使用ajax加载数据
     * @param id 绑定的id，可以为空。
     * @param postUrl       请求数据的url
     * @param param         请求的参数，可为空
     * @param backdata      数据处理方法，如果请求的数据正常，就返回可以绑定的数据；如果出错就返回false，将不执行绑定。
     * @param callback      请求成功的回调方法，可为空
     * @param errorback     请求失败的回调方法，可为空
     */
    x.load = function (id, postUrl, param, backdata, callback, errorback) {
        var opt = {};
        opt.url = postUrl;
        opt.data = param;
        opt.type='POST';
        if (errorback) {
            opt.error = errorback;
        } else if (x.error_callback) {
            opt.error = x.error_callback;
        }else{
            opt.error=function(data,status){
                console.log(status);
            };
        }
        opt.success = function (data) {
            if(typeof data=== 'string'){
                 /* jshint ignore:start */
                data=eval('('+data+')');
                 /* jshint ignore:end */
            }
            var ok = !!data;
            if (x.checkData) {
                if (!x.checkData(data)) {
                    ok = false;
                }
            }
            if (ok && backdata) {
                data = backdata(data);
                if (!data) {
                    ok = false;
                }
            }
            if (ok) {
                if (toString.apply(data) == "[object Array]") {
                    r.bindRepeatData(data, id);
                } else {
                    if (id) {
                        r.bindData(data, id);
                    } else {
                        r.bindData(data);
                    }
                }
            }
            if (callback) {
                callback(ok,data);
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
    //开始初始化将执行ready方法
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