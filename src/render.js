/**
 * XTemplate的运行主体，使用对外使用的变量有$scope，当使用bindData时，数量会按名字注入这个变量。
 *
 * 目前支持两种形式的绑定，单变量绑定和数组。
 * 单变量绑定是以html中name名字为绑定对象，只要名字和绑定的变量同名，即会自动赋值。
 *
 * 例如：<p name='title'></p>
 * 这时如果有一个变量为如下结构{title:'hello world'}，那么，这个name为title的p标签就会显示hello world。
 * 最终会生成
 * <p name='title'>hello world</p>
 * 数组绑定是首先取到一个模板，再把一个数组的内容循环，按模板格式化后返回多行html。
 * 例如：<ul data-repeat-name='listdata'>
 *          <li>{title}</li>
 *      </ul>
 * 这里定义了一个名为listdata的模板，ul的内部html将成为可循环的模板，即<li>{title}</li>为待循环的内容
 * 我们绑定以下变量[{title:'hello 0'},{title:'hello 1'}]
 * 最终会生成
 * <ul data-repeat-name='listdata'>
 *          <li>hello 0</li>
 *          <li>hello 1</li>
 *      </ul>
 *
 * 特殊语法：
 * #号的使用
 * 在模板中使用，例如{#title}，输出title的值，以没有#的区别，这里不会把html进行编码，会输出原始的html。
 * 在函数名中使用，如果在函数名前加#，则指定这个函数为全局函数，这时这个函数必须是已经定义的好的全局函数或是javascript的内部函数。
 *
 * data-bind-src，主要是给img标签用，作用是将src的值组装好后再绑定，这里避免无效的src。
 * 例如：<img src='/{imgsrc}/abc.jpg'>这个src是无效的，但浏览器会加载这个错误的地址引起一次无效的http请求。
 * 正确的做法是<img data-bind-src='/imgsrc/abc.jsp'>或<img data-bind-src='/imgsrc/abc.jsp' src='默认图'>
 *
 * data-bind-to，是指定绑定的属性名称，同时可以使用模板。
 * 例如：<a name='product_id' data-bind-to='href' href='/news/{product_type}/{product_id}/detail.html'>click</a>
 * 在使用bindData时，会将href的内容格式化后重新替换href，以生成一个新的href。
 * 特殊用法，$scope的使用
 * <a name='product_id' data-bind-to='href' href='/news/{$scope.type}/{product_id}/detail.html'>click</a>
 * 如果$scope中有type属性，该值会被带入。
 * 如果其它模板中有与{$scope.type}冲突的，以至于我们取不到正确的模板，那么在前面加一个#来解决
 * {#$scope.type}
 *
 * 函数的使用
 * 目前已经支持了default,case等多个函数。
 * 输出html转义值: {title}
 * 直接输出原始值: {!title}
 * 模板内使用全局值: {#title}，使用$scope{#$scope.title}，输出$scope的原始值{#!$scope.title}
 * 使用函数处理: {title|default,'空标签'}
 * 多个函数可连续使用: {title|default,'空标签'|left,10}，title输出值默认为空标签，最多输出10个字符
 */
(function (w, doc, r) {
    'use strict';
    //全局变量
    w.$scope = {};
    //可绑定的key列表
    r.$bindKey = {};

    //语法处理
    r.syntax = {};
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
        w.$scope[name] = data;
        this.$bindKey[name] = [];
        var i = 0;
        for (var tkey in data) {
            var k = this.util.getName(tkey, data);
            for (i = 0; i < k.length; i++) {
                this.$bindKey[name].push(k[i]);
            }
        }

        for (var j = 0; j < this.$bindKey[name].length; j++) {
            var key = this.$bindKey[name][j], item = w.$scope[name];
            if (name != 'data') {
                key = name + '.' + key;
                item = w.$scope;
            }
            var items = doc.getElementsByName(key);
            var value;
            for (i = 0; i < items.length; i++) {
                value = '';
                var id = items[i].attributes['data-bind-to'];
                if (id) {
                    var xf = r.syntax.buildFunc(key, items[i][id.value]);
                    if (xf) {
                        value = xf(this, item);
                    } else {
                        //如果简单的绑定innerHTML,就不再转为纯文本了
                        if (id.value === 'innerHTML') {
                            value = this.util.getValue(key, item);
                        } else {
                            value = this.util.html(this.util.getValue(key, item));
                        }
                    }
                } else {
                    //单独处理一下img的data-bind-src
                    id = items[i].attributes['data-bind-src'];
                    if (id) {
                        var xff = r.syntax.buildFunc(key, id.value);
                        if (xff) {
                            value = xff(this, item);
                        } else {
                            value = this.util.getValue(key, item);//不需要html转义
                        }
                    } else {
                        value = this.util.html(this.util.getValue(key, item));
                    }
                }

                this.util.setValue(items[i], value);
            }
        }
    };
    /**
     * 重新给某个对象绑定新的值
     * @param name
     * @param value
     */
    r.bindName = function (name, value) {
        var items = doc.getElementsByName(name);
        if (items) {
            //w.$scope[name] = value;
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
        if (!data || data.length < 1) {
            return;
        }
        var func = this.syntax.cacheRepeatFunc(id);
        if (func) {
            var html = '';
            for (var i = 0; i < data.length; i++) {
                html += func(this, data[i]);
            }
            r.syntax.setRepeatHtml(id, html);
        }
    };


    /**
     * 如果需要自行扩展Render的函数，请使用本函数。
     * 这些函数可以在html的模板中使用
     * 增加自定义函数
     * @param func 函数体
     * @param name 函数的名称
     */
    r.addFunc = function (func, name) {
        if (func && name) {
            this.funcs[name] = func;
        }
    };
})
(window, document, window.Render = {});