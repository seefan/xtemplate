/**
 * XTemplate 所有的扩展函数集合，用于处理html中常见的格式转换，默认值等处理。
 * 如果需要自行扩展，请使用window.Render的addFunc函数
 *
 * @class Render.funcs
 */
(function (r, undefined) {
    'use strict';
    /**
     * 指定输出的默认值，如果有值就原样输出，如果空或是null，就输出默认值。
     *
     * 示例：
     *
     *     {name|default,'小明'}
     *
     * @method default
     * @param val {string} 变量名
     * @param defaultVal 默认值
     * @returns {object}
     */
    r.addFunc('default', function (val, defaultVal) {
        if (val === undefined || typeof(val) == 'undefined' || val === '' || val === 'null') {
            return defaultVal;
        }
        return val;
    });
    /**
     * 判断变量是否为空。
     *
     * 示例：
     *
     *     {name|empty,'空','不空'}
     *
     * @method default
     * @param val {string} 变量名
     * @param emptyValue 为空时显示值
     * @param notEmptyValue 不为空时显示的值
     * @returns {object}
     */
    r.addFunc('empty', function (val, emptyValue, notEmptyValue) {
        if (val === undefined || typeof(val) == 'undefined' || val === '' || val === 'null') {
            return emptyValue;
        } else {
            return notEmptyValue;
        }
    });

    /**
     * 根据设定值返回指定内容
     *
     * 示例：
     *
     *     {status|case,-1,'审核不通过',1,'审核通过','待审核'}
     *     {status|case,-1,'审核不通过',1,'审核通过',2,'VIP','待审核'}
     *
     * 参数说明：参数成对出现，第一个是设定值，第二是要返回的值；后续可以增加多个成队的参数；最后一个参数为默认值，所有设定值都不满足时输出
     * @method case
     * @param val {string} 变量名
     * @returns {object}
     */
    r.addFunc('case', function (val) {
        for (var i = 1; i < arguments.length; i += 2) {
            if (val == arguments[i] && i < arguments.length - 1) {
                return arguments[i + 1];
            }
        }
        return arguments[arguments.length - 1];
    });
    /**
     * 格式化货币，最少小数显示，
     * 示例：
     *
     *     {price|format_money}
     *     如果price为10.0100，显示10.01
     *     如果price为10.000，显示10
     *
     * @method format_money
     * @param val {string} 变量名
     * @returns {number}
     */
    r.addFunc('format_money', function (val) {
        return parseFloat(val);
    });


    /**
     * 将 Date 转化为指定格式的String
     * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
     * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     * 示例：
     *
     *     {date|format_date,"yyyy-MM-dd hh:mm:ss.S"}   输出  2006-07-02 08:09:04.423
     *     {date|format_date,"yyyy-M-d h:m:s.S"}    输出  2006-7-2 8:9:4.18
     *     {date|format_date,"yyyy-M-d h:m:s"}    输出  2006-7-2 8:9:4
     *
     * @method format_date
     * @param val {string} 变量名
     * @param fmt {string} 格式串
     * @returns {string} 格式化后的日期串
     */
    r.addFunc('format_date', function (val, fmt) {
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

    });
    /**
     * 数字保留小数位数
     * 示例：
     *
     *     {float_num|fixed,2}
     *
     * @method fixed
     * @param val {string} 要格式的变量名
     * @param c {number} 保留的小数位置，默认为0
     * @returns {number}
     */
    r.addFunc('fixed', function (val, c) {
        if (typeof c == 'undefined') {
            c = 0;
        }
        if (typeof(val) == 'number') {
            return val.toFixed(c);
        } else {
            return val;
        }
    });
    /**
     * 没有正确的函数处理时，用此函数处理，直接输出变量值
     * 外部不要使用
     * @param val {string} 变量名
     * @returns {string}
     */
    r.addFunc('noFunc', function (val) {
        return '没有找到正确的处理函数';
    });
    /**
     * 重复输出num次val
     *
     * 示例：
     *
     *     {num|repeat,'*'}，当num=4时，输出****
     *
     * @method repeat
     * @param val {string} 重复次数
     * @param res {string}要重复的内容
     * @returns {string}
     */
    r.addFunc('repeat', function (val, res) {
        var result = '';
        for (var i = 0; i < val; i++) {
            result += res;
        }
        return result;
    });
    /**
     * 内部实现简单的循环，注意，内部模板和普通模板有区别，需要使用小括号代替大扩号。
     * 常用于嵌套循环显示。
     *
     * 示例：
     *
     *      {array|range,'(id),'}，如果array=[{id:0},{id:1}]，会输出0,1,
     *
     * @method range
     * @param list {string} 要循环的数组变量名
     * @param tmpl {string} 模板
     * @returns {string} 输出的html
     */
    r.addFunc('range', function (list, tmpl) {
        var html = '';
        if (tmpl) {
            tmpl = tmpl.replace(/\(/g, '{').replace(/\)/g, '}');
            var func = r.syntax.buildFunc('range', tmpl);
            if (func) {
                for (var i = 0; i < list.length; i++) {
                    html += func(r, list[i]);
                }
            }
        }
        return html;
    });
    /**
     * 过滤html字符，因为系统默认已过滤html，所以此函数一般外部不使用
     *
     * 示例：
     *
     *     {code|filter_html}
     *
     * @method filter_html
     * @param html {string} 待过滤的html代码
     * @returns {string}
     */
    r.addFunc('filter_html', function (html) {
        return r.util.html(html);
    });
    /**
     * 从左侧按指定长度截断字串，注意一个汉字按2个字符计算，这样可以准确的控制格式
     *
     * 示例：
     *
     *     {str|left,20,'...'}
     *     {str|left,20}
     *
     * @method left
     * @param str {string} 要截断的字串变量名
     * @param len {number} 截断后的字串长度，一个汉字按2个字符计算
     * @param dot {string} [可选] 截断后补充的串，示例:"..."
     * @returns {string}
     */
    r.addFunc('left', function (str, len, dot) {
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
    });
})(window.Render);