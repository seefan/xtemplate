/**
 * 渲染器
 */
function Render() {
    //全局变量
    this.$scope = {};
    //可绑定的key列表
    this.$bindKey = {};
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
    this.$scope[name] = data;
    this.$bindKey[name] = [];
    for (var key in data) {
        var k = getName(key, data);
        for (var i = 0; i < k.length; i++) {
            this.$bindKey[name].push(k[i]);
        }
    }

    for (var j = 0; j < this.$bindKey[name].length; j++) {
        var key = this.$bindKey[name][j];
        var items = document.getElementsByName(key);
        for (var i = 0; i < items.length; i++) {
            var xf = this.cache['xdf-bind-' + key];
            if (xf) {
                setValue(items[i], xf(this.$scope, this.funcs, this.$scope[name]));
            } else {
                setValue(items[i], getValue(key, this.$scope[name]));
            }
            items[i].style.display = '';
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
        //this.$scope[name] = value;
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
        var func = this.cache['xdf-repeat-' + id];
        if (func) {
            tmp.innerHTML = func(this.$scope, this.funcs, data[i]);
        }

        tmp.style.display = '';
        nextItem = tmp;
    }
    while ((nextItem = getNextSibling(nextItem)) != false) {
        nextItem.style.display = 'none';
    }
}


/**
 * 增加自定义函数
 * @param func
 * @param name
 */
Render.prototype.addFunc = function (func, name) {
    this.funcs[name] = func;
}