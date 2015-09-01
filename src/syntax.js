(function (r) {
    'use strict';

    /**
     * 处理绑定函数
     * @param item
     * @param cache
     */
    function initBind(item, cache) {
        var id = item.attributes['data-bind-func'];
        if (id) {
            var name = item.attributes['name'].value;
            var funcBody = '(function (my,vo){var $scope=my.$scope;return ' + runTemplate('{' + name + '|' + id.value + '}') + ';})';
            try {
                cache['xdf-bind-' + name] = eval(funcBody);
                return true;
            } catch (e) {
                console.log('解析bind模板' + id.value + '出错，' + e.message);
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
                word = tmpl.substring(start + 1, end);
                result.push(runText(tmpl.substring(i, start)));
                result.push(runKeyword(word));
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
            return '""';
        }
    }

    /**
     * 处理函数
     * @param funcString
     * @param val
     * @returns {*}
     */
    function runKeyword(funcString) {
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
            return 'my.funcs.' + funcName
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
        if (word.length > 0) {
            if (word[0] === '$' || r.util.isNumber(word) || word[0] === '"' || word[0] === "'") {
                return word;
            } else {
                return "my.util.getValue('" + word + "',vo)";
            }
        }
        return '""';
    }

    /**
     * 初始化语法结构
     * @param id 渲染器的有效范围id
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
     * @param cache
     */
    r.initRepeat = function (item, id) {
        var f = this.cache['xd-repeat-' + id];
        if (f) {
            return f;
        }
        item.style.display = 'none';
        this.cache['xd-repeat-' + id] = item;
        var funcBody = '(function (my,vo){var $scope=my.$scope;return ' + runTemplate(item.innerHTML) + ';})';
        try {
            f = eval(funcBody);
        } catch (e) {
            f = function () {
            };
            console.log('解析repeat模板' + id + '出错，' + e.message);
        }
        this.cache['xdf-repeat-' + id] = f;
        return f;
    }

})(window.Render);