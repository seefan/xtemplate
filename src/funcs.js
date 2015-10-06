/**
 * XTemplate 所有的扩展函数集合，用于处理html中常见的格式转换，默认值等处理。
 *
 * 如果需要自行扩展，请使用window.Render的addFunc函数
 */
(function (r) {
    'use strict';
    var f = window.Render.funcs;
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
     * 简单的循环
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
     * 过滤html字符
     * @param html
     * @returns {string|*}
     */
    f.filter_html = function (html) {
        return r.util.html(html);
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
})(window.Render);