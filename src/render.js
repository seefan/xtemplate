/**
 * XTemplate的运行主体，使用对外使用的变量有$scope，当使用bindData时，数量会按名字注入这个变量。
 *
 * 目前支持两种形式的绑定，单变量绑定和数组。
 *
 * 单变量绑定是以html中name名字为绑定对象，只要名字和绑定的变量同名，即会自动赋值。
 *
 * 例如：
 *
 *     <p data-bind='title'></p>
 *
 * 这时如果有一个变量为如下结构{title:'hello world'}，那么，这个name为title的p标签就会显示hello world。
 *
 * 最终会生成
 *
 *     <p name='title'>hello world</p>
 *
 * 数组绑定是首先取到一个模板，再把一个数组的内容循环，按模板格式化后返回多行html。
 *
 * 例如：
 *
 *     <ul data-repeat-name='listdata'>
 *          <li>{title}</li>
 *     </ul>
 *
 * 这里定义了一个名为listdata的模板，ul的内部html将成为可循环的模板，即<li>{title}</li>为待循环的内容
 *
 * 我们绑定以下变量[{title:'hello 0'},{title:'hello 1'}]
 *
 * 最终会生成
 *
 *     <ul data-repeat-name='listdata'>
 *          <li>hello 0</li>
 *          <li>hello 1</li>
 *     </ul>
 *
 * 特殊语法：
 *
 * !号的使用
 *
 * 在模板中使用，例如{!title}，输出title的值，以没有!的区别，这里不会把html进行编码，会输出原始的html。
 *
 * #号的使用
 *
 * 在函数名中使用，如果在函数名前加#，则指定这个函数为全局函数，这时这个函数必须是已经定义的好的全局函数或是javascript的内部函数。
 *
 * data-bind-src，主要是给img标签用，作用是将src的值组装好后再绑定，这里避免无效的src。
 *
 * 例如：
 *
 *     <img src='/{imgsrc}/abc.jpg'/>
 *
 * 这个src是无效的，但浏览器会加载这个错误的地址引起一次无效的http请求。
 * 正确的做法是
 *
 *     <img data-bind-src='/imgsrc/abc.jsp'>或<img data-bind-src='/imgsrc/abc.jsp' src='默认图'/>
 *
 * data-bind-to，是指定绑定的属性名称，同时可以使用模板。如果要绑定多个属性，用空格分开。
 *
 * 例如：
 *
 *     <a data-bind='product_id' data-bind-to='href' href='/news/{product_type}/{product_id}/detail.html'>click</a>
 *
 * 在使用bindData时，会将href的内容格式化后重新替换href，以生成一个新的href。
 *
 * 使用全局变量，只要在变量前加上#就不会使用内部变量，而是改为全局变量
 *
 * 例如：$scope的使用
 *
 *     <a data-bind='product_id' data-bind-to='href' href='/news/{#$scope.type}/{product_id}/detail.html'>click</a>
 *
 * 如果$scope中有type属性，该值会被带入。
 *
 *
 * @class render
 */
(function (w, doc, r) {
    'use strict';
    //
    /**
     * 全局变量，绑定到window
     * @property $scope
     * @type {object}
     */
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
     *
     * 当未指定名称时，在绑定时直接使用属性名，例：{key:'key1'}，绑定时只需key即可
     * 当指定名称时，在绑定时需要在属性名前加上指定的名称，例：{key:'key1'}，名称为data1,绑定时需data1.key
     * 绑定的数据会缓存在$scope内
     *
     * 示例：
     *
     *     bindData('data',{id:1});绑定时用data-bind='data.id'，如<p data-bind='data.id'/>
     *     bindData({id:1});绑定时用id，注意此时省略了名称
     *
     * @method bindData
     * @param name 绑定对象的名称，如果不设置时定的key不加绑定名
     * @param data 要绑定的数据
     */
    r.bindData = function (name, data) {
        if (typeof data == 'undefined') {
            data = name;
            name = '__data';
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
            if (name != '__data') {
                key = name + '.' + key;
                item = w.$scope;
            }
            var items = doc.querySelectorAll('[data-bind="' + key + '"]');
            var value, tpl;
            for (i = 0; i < items.length; i++) {
                value = '';
                var bs = this.util.getBindToNameList(items[i]);
                if (bs.length > 0) {
                    for (var m in bs) {
                        var attrName = bs[m];
                        if (items[i].attributes.hasOwnProperty(attrName)) {
                            tpl = items[i].attributes[attrName].value;
                        } else {
                            tpl = items[i][attrName];
                        }
                        var xf = r.syntax.buildFunc(key, tpl);
                        if (xf) {
                            value = xf(this, item);
                        } else {
                            //如果简单的绑定innerHTML,就不再转为纯文本了
                            if (attrName === 'innerHTML') {
                                value = this.util.getValue(key, item);
                            } else {
                                value = this.util.html(this.util.getValue(key, item));
                            }
                        }
                    }

                } else {
                    //单独处理一下img的data-bind-src
                    var id = items[i].attributes['data-bind-src'];
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
                this.util.show(items[i]);
            }
        }
    };
    /**
     * 重新给某个对象绑定新的值，修改后的值不会更新$scope内部缓存的值
     *
     * @method bindName
     * @param name 绑定名，用data-bind指定
     * @param value 绑定值
     */
    r.bindName = function (name, value) {
        var items = doc.querySelectorAll('[data-bind=' + key + ']');
        if (items) {
            for (var i = 0; i < items.length; i++) {
                this.util.setValue(items[i], value);
                this.util.show(items[i]);
            }
        }
    };
    /**
     * 循环绑定数据值
     *
     * 示例：
     *
     *     bindRepeatData([{id:1},{id:2}])
     *     bindRepeatData('news',[{id:1},{id:2}])
     *
     * @method bindRepeatData
     * @param name 要循环输出的模板范围的名称，默认为data，可省略不写
     * @param data 要绑定的数据
     */
    r.bindRepeatData = function (name, data) {
        if (typeof data == 'undefined') {
            data = name;
            name = 'data';
        }
        if (!data || data.length < 1) {
            return;
        }
        var func = this.syntax.cacheRepeatFunc(name);
        if (func) {
            var html = '';
            for (var i = 0; i < data.length; i++) {
                html += func(this, data[i]);
            }
            this.syntax.setRepeatHtml(name, html);
        }
    };


    /**
     * 如果需要自行扩展Render的函数，请使用本函数。
     * 这些函数可以在html的模板中使用
     *
     * 示例：
     *
     *     addFunc('test',function(){
     *        alert('test');
     *     });
     *
     * 使用时和内部函数一样，语法为{name|test}
     *
     * @method addFunc
     * @param name 函数的名称
     * @param func 函数体
     */
    r.addFunc = function (name, func) {
        if (func && name) {
            this.funcs[name] = func;
        }
    };
})
(window, document, window.Render = {});