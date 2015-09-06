(function (document, r) {
    'use strict';
    //全局变量
    r.$scope = {};
    //可绑定的key列表
    r.$bindKey = {};
    //缓存
    r.cache = {};
    //内部函数
    r.funcs = {};
    //工具
    r.util = {};
    /**
     * 绑定数据值
     * @param id 缓存范围的id
     * @param data 要绑定的数据
     */
    r.bindData = function (data, name) {
        if (!name) {
            name = 'data';
        }
        this.$scope[name] = data;
        this.$bindKey[name] = [];
        var i = 0;
        for (var tkey in data) {
            var k = this.util.getName(tkey, data);
            for (i = 0; i < k.length; i++) {
                this.$bindKey[name].push(k[i]);
            }
        }

        for (var j = 0; j < this.$bindKey[name].length; j++) {
            var key = this.$bindKey[name][j], item = this.$scope[name];
            if (name != 'data') {
                key = name + '.' + key;
                item = this.$scope;
            }

            var items = document.getElementsByName(key);
            for (i = 0; i < items.length; i++) {
                var xf = this.cache['xdf-bind-' + key], value;
                if (xf) {
                    value = xf(this, item);
                } else {
                    value = this.util.getValue(key, item);
                }
                var isHtml = items[i].attributes['data-bind-html'];
                if (!(isHtml && isHtml.value === 'true')) {
                    value = this.util.html(value);
                }

                this.util.setValue(items[i], value);
                items[i].style.display = '';
            }
        }
    };
    /**
     * 重新给某个对象绑定新的值
     * @param name
     * @param value
     */
    r.bindName = function (name, value) {
        var items = document.getElementsByName(name);
        if (items) {
            //this.$scope[name] = value;
            for (var i = 0; i < items.length; i++) {
                this.util.setValue(items[i], value);
                items[i].style.display = '';
            }
        }
    };
    /**
     * 循环绑定数据值
     * @param id 缓存范围的id
     * @param data 要绑定的数据
     */
    r.bindRepeatData = function (data, id) {
        var item = this.cache['xd-repeat-' + id];
        if (!item) {
            return;
        }
        if (!data || data.length < 1) {
            return;
        }
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var func = this.cache['xdf-repeat-' + id];
            if (func) {
                html += func(this, data[i]);
            }
        }
        item.innerHTML = html;
    };


    /**
     * 增加自定义函数
     * @param func
     * @param name
     */
    r.addFunc = function (func, name) {
        if (func && name) {
            this.funcs[name] = func;
        }
    };
})(document, window.Render = {});