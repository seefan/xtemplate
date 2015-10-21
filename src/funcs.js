/**
 * XTemplate 所有的扩展函数集合，用于处理html中常见的格式转换，默认值等处理。
 *
 * 如果需要自行扩展，请使用window.Render的addFunc函数
 */
(function (r) {
    'use strict';
    var f = window.Render.funcs;
    /**
     * 指定输出的默认值，如果有值就原样输出，如果空或是null，就输出默认值。
     * 示例：{name|default,'小明'}
     * @param val 变量名
     * @param defaultVal 默认值
     * @returns {*}
     */
    f.default = function (val, defaultVal) {
        if (typeof(val) == 'undefined' || val === '' || val === 'null') {
            return defaultVal;
        }
        return val;
    };
    /**
     * 根据设定值返回指定内容
     * 示例：{status|case,-1,'审核不通过',1,'审核通过','待审核'}
     * 参数说明：参数成对出现，第一个是设定值，第二是要返回的值；后续可以增加多个成队的参数；最后一个参数为默认值，所有设定值都不满足时输出
     * @param val 变量名
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
     * @param val 变量名
     * @returns {Number}
     */
    f.format_money = function (val) {
        return parseFloat(val);
    };


    /**
     * 将 Date 转化为指定格式的String
     * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
     * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     * 例子：
     * {date|format_date,"yyyy-MM-dd hh:mm:ss.S"} ==> 2006-07-02 08:09:04.423
     * {date|format_date,"yyyy-M-d h:m:s.S"}      ==> 2006-7-2 8:9:4.18
     * @param val 变量名
     * @param fmt 格式串
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
     * 示例：{float_num|fixed,2}
     * @param num 要格式的小数
     * @param c 保留的小数位置，默认为0
     * @returns {string}
     */
    f.fixed = function (num, c) {
        if (typeof c == 'undefined') {
            c = 0;
        }
        if (num) {
            return num.toFixed(c);
        } else {
            return '';
        }
    };
    /**
     * 没有正确的函数处理时，用此函数处理，直接输出变量值
     * 外部不要使用
     * @param val 变量名
     * @returns {*}
     */
    f.noFunc = function (val) {
        return val;
    };
    /**
     * 重复输出num次val
     * {num|repeat,'*'}，当num=4时，输出****
     * @param num 重复次数
     * @param val 要重复的内容
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
     * 内部实现简单的循环，注意，内部模板和普通模板有区别，需要使用小括号代替大扩号。
     * 示例：{array|range,'(id),'}，如果array=[{id:0},{id:1}]，会输出0,1,
     * @param list 要循环的数组
     * @param tmpl 模板
     * @returns {string} 输出的html
     */
    f.range = function (list, tmpl) {
        var html = '';
        if (tmpl) {
            tmpl = tmpl.replace('(', '{').replace(')', '}');
            var func = r.syntax.buildFunc('range', tmpl);
            if (func) {
                for (var i = 0; i < list.length; i++) {
                    html += func(r, list[i]);
                }
            }
        }
        return html;
    };
    /**
     * 过滤html字符，因为系统默认已过滤html，所以此函数一般外部不使用
     * @param html 待过滤的html代码
     * 示例：{code|filter_html}
     * @returns {string|*}
     */
    f.filter_html = function (html) {
        return r.util.html(html);
    };
    /**
     * 从左侧按指定长度截断字串，注意一个汉字按2个字符计算，这样可以准确的控制格式
     * 示例：{str|left,20,'...'}
     * 示例：{str|left,20}
     * @param str 要截断的字串
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
})(window.Render);