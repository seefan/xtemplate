/**
 * XTemplate的运行主体，对外使用的变量有$scope，当使用bindData时，变量会按绑定名字注入这个变量。
 *
 * 目前支持两种形式的绑定，单变量绑定和数组。
 *
 * 单变量绑定
 * =============
 *
 * 是以html中data-bind标记为绑定对象，只要data-bind的内容和绑定的变量同名，即会自动赋值。
 *
 * 例如：
 *
 *     <p data-bind='title'></p>
 *
 * 这时如果有一个变量为如下结构{title:'hello world'}，那么，这个data-bind为title的p标签就会显示hello world。
 *
 * 最终会生成
 *
 *     <p data-bind='title'>hello world</p>
 *
 *
 * 使用方法参见示例：
 *
 * 1.普通绑定：输出到p的默认内容中，此处为innerHTML属性。一般img将输出到src，input输出到value，其它输出到innerHTML。
 *
 *     <p data-bind="content"></p>
 *
 * 2.原始值按html输出：
 *
 *     <p data-bind="content" data-bind-to="innerHTML"></p>
 *     或
 *     <p data-bind="content" data-bind-to="innerHTML">{!content}</p>
 *     第1种为简写，第2种为data-bind-to的标准写法
 *
 *
 * 3.data-bind-to使用：
 *
 *     <b data-bind="market_product_id" data-bind-to="title" title="{!content}">title</b>
 *
 *     data-bind-to指定了输出的属性，所以将绑定的内容将按data-bind-to进行绑定。此处data-bind-to为title，
 *     待绑定的属性内容要使用模板。
 *     所以XTemplate将会把market_product_id的值绑定到title属性上。
 *     此处模板内content前有个叹号“！”，代表输出原始值，不进行html转义。
 *
 * 4.模板输出：必须使用data-bind-to指定属性名，默认的输出属性值不会当作模板。
 *
 *     <p data-bind="content" data-bind-to="innerHTML"><b>{content|default,'没有内容显示'}</b></p>
 *
 *     content的内容会以内部html为模板绑定后显示
 *
 *     如果content为空，最终输出
 *
 *     <p data-bind="content" data-bind-to="innerHTML"><b>没有内容显示</b></p>
 *
 *     如果刚开始不想显示出模板的内容，可以将p设置为隐藏
 *
 *     <p style="display:none" data-bind-to="innerHTML" data-bind="content"><b>{content|default,'没有内容显示'}</b></p>
 *
 *     或
 *
 *     <p class="hide" data-bind-to="innerHTML" data-bind="content"><b>{content|default,'没有内容显示'}</b></p>
 *
 *     绑定后style.display将被重置为空，css中的hide也会被移除。
 *
 * 5.img的src绑定：
 *
 *     <img data-bind="thumb"/>
 *     最终输出<img data-bind="thumb" src="图片地址"/>
 *
 *     指定img的默认显示图片，直接使用原来的src指定默认图
 *     <img data-bind="imgsrc" data-bind-src='/{imgsrc}/abc.jpg' src='默认图'/>
 *
 *     如果img的地址比较复杂，是组合而成，或是需要用函数，可以使用data-bind-src来指定src的模板。
 *     <img data-bind="thumb" data-bind-src="{thumb1|default,'logo.jpg'}"/>
 *
 *     注意不要用src属性！！！
 *
 *     不使用data-bind-to指定src，是因为如果指定img的src，将会使浏览器多产生一个无效的http请求，影响加载效果。
 *
 *     错误的例子：<img data-bind="thumb" data-bind-to="src" src='/{imgsrc}/abc.jpg'>
 *     /{imgsrc}/abc.jpg这个地址是不存在的地方，所以会引起一个错误的http请求。
 *
 *
 * 数组绑定
 * =============
 * 数组绑定是指定一个模板，并把数组的内容循环，按模板格式化后返回多行html。
 *
 * 例如：
 *
 *      <ul data-repeat-name='listdata'>
 *          <li>{title}</li>
 *      </ul>
 *
 * 这里定义了一个名为listdata的模板，ul的内部html将成为可循环的模板，即
 *
 *      <li>{title}</li>
 *
 * 为待循环的内容
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
 * 使用方法参见示例：
 *
 * 1.普通输出：
 *
 *      <ul data-repeat-name='data'>
 *          <li>{market_product_id}:{product_name}</li>
 *      </ul>
 *
 * 2.img的src绑定：
 *
 *      <ul data-repeat-name='data'>
 *          <li><img data-bind-src='{thumb}'/>{market_product_id}:{!content}</li>
 *      </ul>
 *
 *      这里与单变量绑定不同的是没有使用data-bind指定绑定的属性，其它使用方法完全一致。
 *
 * 模板的使用
 * =============
 *
 * 模板的基本语法是{模板内容}，两端以大括号包围，中间为模板的内容。
 *
 * 如：{username}，即输出变量username的内容。
 *
 * 模板可以在循环的模板中使用，也可以在待绑定属性中使用，也可以在data-bind-src中使用。
 *
 * 使用方法参见示例：
 *
 * 1.使用内部函数处理输出结果：
 *
 *
 *     {market_product_num|repeat,'*'}//最终输出market_product_num个*，{{#crossLink "Render.funcs/repeat:method"}}{{/crossLink}}为内部函数
 *
 *     语法为：[属性名]|[函数]|[函数]
 *     属性名后竖线"|"连接函数名，当前的属性必须为函数的第1个参数。
 *     多个函数时依次用竖线连接，前一个函数作为后一个函数的第一个变量输入。
 *
 *     如：{user_money|format_money}，其中user_money为绑定属性名，{{#crossLink "Render.funcs/format_money:method"}}{{/crossLink}}为内部函数名，主要作用为格式化货币。
 *
 *     如果函数有多个参数，使用逗号连接。
 *
 *
 * 2.使用外部函数处理输出结果：
 *
 *     {market_product_id|#hello,':)'}
 *
 *     函数名前加了#号，代表使用外部函数，此处使用了hello，该函数使用前一定要定义。
 *
 *     此处market_product_id的值会传给s变量，即第1个变量。
 *
 *     示例1：
 *
 *     function hello(s){
 *         return s+' hello';
 *     }
 *
 *     示例2：
 *     function hello(s,v){
 *         return s+'hello'+v;
 *     }
 *
 *
 * 3.使用多个函数处理输出结果：
 *
 *     {market_product_id|repeat,'@@'|#hello,':)'}
 *
 *     用|连接即可。
 *
 * 4.使用外部变量：
 *
 *     {id}={#out_abc}
 *
 *     变量前加#
 *
 * 5.进行简单的运算：
 *
 *     {market_product_id * 3 + 12}
 *
 *     在模板中，属性名支持简单的加减乘除运算，复杂的请使用自定义函数处理。
 *
 * 6.在模板中处理子循环：
 *
 *     {list|range,'ID:(id)&nbsp; '}
 *
 *     使用内部函数range，参数为模板内容。但为了区分子模板和主模板，子模板使用小括号“()”代替大括号。
 *
 *
 *
 * 特殊语法：
 * =============
 *
 * !号的使用
 *
 * 在模板中使用，例如{!title}，输出title的值，以没有!的区别，这里不会把html进行编码，会输出原始的html。
 *
 * #号的使用
 *
 * 在函数名中使用，如果在函数名前加#，则指定这个函数为全局函数，这时这个函数必须是已经定义好的全局函数或是javascript的内部函数。
 * 在变量名中使用，如果果变量名前加#，则指定这个变量为全局变量，这时这个变量必须是已经定义好的全局变量。
 *
 *
 * 绑定示例
 * =============
 *
 *     注意：使用load方法，需要jQuery的支持，详细见API中关于函数的介绍
 *
 *     第1个参数为为绑定名称，第2个为请求的数据地址，第3个为请求的参数，第4个为数据过滤处理，一般用于把要绑定的数据返回。
 *
 * json的数据内容为
 *
 *     {
 *     "error":0,
 *     "data":[
 *      {"thumb":"../images/product-1.jpg","product_name":"体验品","price":12,"oldprice":100},
 *      {"thumb":"../images/product-2.jpg","product_name":"体验品","price":13,"oldprice":100},
 *      {"thumb":"../images/product-3.jpg","product_name":"体验品","price":24,"oldprice":100},
 *      {"thumb":"../images/product-4.jpg","product_name":"体验品","price":15,"oldprice":100},
 *      {"thumb":"../images/product-5.jpg","product_name":"体验品","price":65,"oldprice":100},
 *      {"thumb":"../images/product-6.jpg","product_name":"体验品","price":32,"oldprice":100}
 *     ]}
 *
 * 模板内容为
 *
 *     <ul data-repeat-name='data0'>
 *         <li>{product_name} {price} <s>{oldprice}</s> </li>
 *     </ul>
 *
 * script为
 *
 *      XTemplate.ready(function () {
 *         this.load('data0', 'data.json', {}, function (e) {
 *             return e.data;
 *         });
 *     });
 *
 * 最终将输出
 *
 *     <ul data-repeat-name='data0'>
 *          <li>体验品 12 <s>100</s> </li>
 *          <li>体验品 13 <s>100</s> </li>
 *          <li>体验品 24 <s>100</s> </li>
 *          <li>体验品 15 <s>100</s> </li>
 *          <li>体验品 65 <s>100</s> </li>
 *          <li>体验品 32 <s>100</s> </li>
 *     </ul>
 *
 * @class Render
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
        if (typeof data === 'undefined') {
            data = name;
            name = '__data';
        }
        w.$scope[name] = data;
        this.$bindKey[name] = [];
        var i = 0, tkey;
        for (tkey in data) {
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
                var bs = this.util.getBindToNameList(items[i]);//data-bind-to
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
                    //单独处理一下img的data-bind-src，使用模板
                    if (items[i].tagName == 'IMG' && items[i].attributes.hasOwnProperty('data-bind-src')) {
                        var xff = r.syntax.buildFunc(key, items[i].attributes['data-bind-src'].value);
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
        var items = doc.querySelectorAll('[data-bind="' + name + '"]');
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
     * @param append [可选] 是否追加数据，默认为false
     * @param animation [可选] 是否追加数据，默认为false
     */
    r.bindRepeatData = function (name, data, append, animation) {
        if (typeof data == 'undefined') {
            data = name;
            name = 'data';
        }
        if (!data || data.length < 1) {
            return;
        }
        var func = this.syntax.cacheRepeatFunc(name), i = 0;
        if (func) {
            if (animation === true) {
                //for (i = 0; i < data.length; i++) {
                //    this.syntax.setRepeatHtml(name, func(this, data[i]), i === 0 ? (append === true ? true : false) : true);
                //}
                this.appendData(data, 0, name, func, append);
            } else {
                var html = '';
                for (i = 0; i < data.length; i++) {
                    html += func(this, data[i]);
                }
                this.syntax.setRepeatHtml(name, html, append);
            }
        }
    };
    r.appendData = function (data, i, name, func, append) {
        r.syntax.setRepeatHtml(name, func(this, data[i]), i === 0 ? (append === true ? true : false) : true);
        i++;
        if (i < data.length) {
            setTimeout(function () {
                r.appendData(data, i, name, func, append);
            }, 100);
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