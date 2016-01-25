/**
 * Render 的语法定义
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
                end = getEnd(tmpl, start, '}');
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
            return '"' + text.replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace('data-bind-src', 'src') + '"';
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
        if (funcString) {
            var f = splitWord(funcString);
            if (f.length > 0) {
                if (filterHtml) {
                    return 'Render.util.html(' + runFuncString(f, f.length - 1) + ')';
                } else {
                    return runFuncString(f, f.length - 1);
                }
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
        if (funcs.length === 1) {
            return runValue(funcs[0]);
        }
        if (i > 0) {
            var array = [], j = 0, args = '';
            for (; i >= 0; i--) {
                if (funcs[i] === '|') {//发现一个函数
                    var funcName = array.pop();
                    for (j = array.length; j > 0; j--) {
                        args += runValue(array[j - 1]);
                    }

                    args = runFuncString(funcs, i - 1) + args;

                    return runFunc(funcName) + '(' + args + ')';
                } else {
                    array.push(funcs[i]);
                }
            }
            if (array.length > 0) {
                for (j = array.length; j > 0; j--) {
                    args += runValue(array[j - 1]);
                }
                return args;
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
        if (funcName && funcName.length > 1 && funcName.charAt(0) == '#') {
            return funcName.substring(1);
        } else if (r.funcs[funcName]) {
            return 'my.funcs["' + funcName + '"]';
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
        switch (word.charAt(0)) {
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
                val += word;
                break;
            case '|'://内部用，不开放
                val += '+';
                break;
            case ','://内部用，不开放
                val += ',';
                break;
            case '#'://外部变量
                val += word.substring(1);
                break;
            default :
                val += "my.util.getValue('" + word + "',vo)";
                break;
        }

        return val === '' ? "''" : val;
    }

    /**
     * 拆分单词
     * @param word
     * @returns {Array}
     */
    function splitWord(word) {
        var arr = [], key = '', end = 0, value;
        for (var i = 0; i < word.length; i++) {
            value = word.charAt(i);
            switch (value) {
                case '|':
                case ',':
                case '+':
                case '-':
                case '*':
                case '/':
                    if (key !== '') {
                        arr.push(key);
                        key = '';
                    }
                    arr.push(value);
                    break;
                case '"':
                case "'":
                    if (key !== '') {
                        arr.push(key);
                        key = '';
                    }
                    end = getEnd(word, i, value);
                    if (end > 0) {
                        arr.push(word.substring(i, end + 1));
                        i = end;
                    }
                    break;
                default :
                    if (value && value !== ' ') {
                        key += value;
                    }
                    break;
            }
        }
        if (key !== '') {
            arr.push(key);
        }
        return arr;
    }

    /**
     * 根据单词开始取结尾,
     * @param word
     * @param i
     * @param ec
     * @returns {*}
     */
    function getEnd(word, i, ec) {
        for (var j = i + 1; j < word.length; j++) {
            if (word.charAt(j) == ec) {//找到结尾
                return j;
            } else if (word.charAt(j) == '"' || word.charAt(j) == "'") {
                i = getEnd(word, j, word.charAt(j));
                if (i === 0) {
                    return 0;
                } else {
                    j = i;
                }
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
        var tpl;
        try {
            tpl = decodeURIComponent(html);
        } catch (e) {
            tpl = html;
        }
        tpl = r.util.trim(tpl);
        if (tpl.length > 0) {
            var funcBody = 'return ' + runTemplate(tpl) + ';';
            try {
                /* jshint ignore:start */
                return new Function('my', 'vo', funcBody);
                /* jshint ignore:end */
            } catch (e) {
                console.log('解析模板' + name + '出错，' + e.message);
                console.log(funcBody);
            }
        }
        return false;
    };
    /**
     * 初始化语法结构
     * @param document 渲染器的有效范围
     */
    r.init = function (document) {
        var items, i;
        if (this.hideRepeat) {
            items = document.querySelectorAll('[data-repeat-name]');
            for (i = 0; i < items.length; i++) {
                this.util.show(items[i], false);
            }
        }
        if (this.hideBind) {
            items = document.querySelectorAll('[data-bind]');
            for (i = 0; i < items.length; i++) {
                this.util.show(items[i], false);
            }
        }
    };
    /**
     * 返回有缓存的方法
     * @param id
     * @returns {*}
     */
    r.syntax.cacheFunc = function (type, id, html) {
        var f = this.cache[type + '-func-' + id];
        if (!f) {
            f = this.buildFunc(id, html);
            if (f) {
                this.cache[type + '-func-' + id] = f;
            }
        }
        return f;
    };
})(window.Render);