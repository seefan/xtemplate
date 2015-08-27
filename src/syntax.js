/**
 * 初始化语法结构
 * @param id 渲染器的有效范围id
 */
function initSynctax(items, cache) {
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        initRepeat(item, cache);
    }
}
/**
 * 处理绑定函数
 * @param item
 * @param cache
 */
//function initFunc(item, cache) {
//    var func = items[i].attributes['data-bind-func'];
//}
/**
 * 处理循环
 * @param item
 * @param cache
 */
function initRepeat(item, cache) {
    var id = item.attributes['data-repeat-name'];
    if (id) {
        item.style.display = 'none';
        cache['xd-repeat-' + id.value] = item;
        var funcBody = '(function ($scope,func,vo){return ' + runTemplate(item.innerHTML) + ';})';
        try {
            cache['xdf-repeat-' + id.value] = eval(funcBody);
        } catch (e) {
            cache['xdf-repeat-' + id.value] = function () {
            };
            console.log('解析repeat模板' + id + '出错，' + e.message);
        }
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
        if (start != -1) {
            end = tmpl.indexOf('}', start + 1);
            if (end == -1) {
                end = tmpl.length;
            }
            word = tmpl.substring(start + 1, end);
            result.push(runText(tmpl.substring(i, start)));
            result.push(runFunc(word));
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
    if (text) {
        return '"' + text.replace(/\"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n') + '"';
    } else {
        return '""'
    }
}
/**
 * 处理函数
 * @param funcString
 * @param val
 * @returns {*}
 */
function runFunc(funcString) {
    var f = funcString.split('|');
    if (f.length > 0) {
        return runFuncString(f, f.length - 1);
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
            return 'func.' + funcName + '(' + funcArray.join(',') + ')';
        }
    } else {
        return runWord(funcs[0]);
    }
    return '';
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
function runWord(word) {
    if (word.length > 0) {
        if (word.charAt(0) == '$' || isNumber(word) || word.charAt(0) == '"' || word.charAt(0) == "'") {
            return word;
        } else {
            return "getValue('" + word + "',vo)";
        }
    }
    return '""'
}