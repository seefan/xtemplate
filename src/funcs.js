/**
 * 默认值
 * @param val
 * @param defaultVal
 * @returns {*}
 */
function defaultValue(val, defaultVal) {
    if (!val && defaultVal) {
        return defaultVal;
    }
    return val;
}
/**
 * 按值选择返回内容
 * @param val
 * @returns {*}
 */
function selectCase(val) {
    for (var i = 1; i < arguments.length; i += 2) {
        if (val == arguments[i] && i < arguments.length - 1) {
            return arguments[i + 1];
        }
    }
    return arguments[arguments.length - 1];
}
/**
 * 格式化货币
 * @param val
 * @returns {Number}
 */
function formatCurrency(val) {
    return parseFloat(val);
}


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
function formatData(val, fmt) {
    if (typeof(val) == 'number') {
        val = new Date(val);
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

}
/**
 * 数字保留小数位数
 * @param num
 * @param c
 * @returns {string}
 */
function toFixed(num, c) {
    return num.toFixed(c);
}
/**
 * 初始化自定义函数
 * @param cache
 */
function initFuncs(cache) {
    cache['default'] = defaultValue;
    cache['case'] = selectCase;
    cache['format_currency'] = formatCurrency;
    cache['format_date'] = formatData;
}