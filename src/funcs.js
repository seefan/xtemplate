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
 * 初始化自定义函数
 * @param cache
 */
function initFuncs(cache) {
    cache['default'] = defaultValue;
    cache['case'] = selectCase;
}