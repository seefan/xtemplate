/**
 * 渲染器
 */
function Render() {
    //全局变量
    this.$scope = {};
    //缓存
    this.cache = {};
    //内部函数
    this.funcs = {};
    //初始化语法结构
    initSynctax(document.all, this.cache);
    //初始化自带的函数
    initFuncs(this.funcs);
}

/**
 * 绑定数据值
 * @param id 缓存范围的id
 * @param data 要绑定的数据
 */
Render.prototype.bindData = function (data, name) {
    if (!name) {
        name = 'data';
    }
    if (!this.$scope[name]) {
        this.$scope[name] = {};
    }
    for (var key in data) {
        var kv = getNameValue(key, data);
        for (var i = 0; i < kv.length; i++) {
            this.$scope[name][kv[i][0]] = kv[i][1];
        }
    }
    for (var key in this.$scope[name]) {
        var items = document.getElementsByName(key);
        if (items) {
            for (var i = 0; i < items.length; i++) {
                setValue(items[i], this.$scope[name][key]);
                items[i].style.display = '';
            }
        }
    }
}
/**
 * 重新给某个对象绑定新的值
 * @param name
 * @param value
 */
Render.prototype.bindName = function (name, value) {
    var items = document.getElementsByName(name);
    if (items) {
        this.$scope[name] = value;
        for (var i = 0; i < items.length; i++) {
            setValue(items[i], value);
            items[i].style.display = '';
        }
    }
}
/**
 * 循环绑定数据值
 * @param id 缓存范围的id
 * @param data 要绑定的数据
 */
Render.prototype.bindRepeatData = function (data, id) {
    var item = this.cache['xd-repeat-' + id];
    if (!item) {
        return;
    }
    if (!data || data.length < 1) {
        return;
    }
    var nextItem = item;
    for (var i = 0; i < data.length; i++) {
        var tmp = getNextSibling(nextItem);
        if (!tmp) {
            tmp = document.createElement(item.tagName);
            insertAfter(tmp, nextItem);
        }
        tmp.innerHTML = this.runFunc(id, data[i]);
        tmp.style.display = '';
        nextItem = tmp;
    }
    while ((nextItem = getNextSibling(nextItem)) != false) {
        nextItem.style.display = 'none';
    }
}

/**
 * 处理函数
 * @param funcString
 * @param val
 * @returns {*}
 */
Render.prototype.runFunc = function (id, vo) {
    var func = this.cache['xdf-repeat-' + id];
    if (func) {
        return func(this.$scope, this.funcs, vo);
    }
    return '';
}
/**
 * 增加自定义函数
 * @param func
 * @param name
 */
Render.prototype.addFunc = function (func, name) {
    this.funcs[name] = func;
}