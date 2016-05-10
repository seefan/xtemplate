/**
 * XTemplate，简单快速的将json数据绑定到html上
 * @class XTemplate
 */
(function (d, w, x,r) {
    'use strict';
    //是否已初始化
    x.isInit = false;
    //是否使用其它的ajax方法，默认使用jquery
    x.optAjax = false;
    x.hideRepeat = true;
    x.hideBind = false;
    //准备方法，XTemplate的入口方法，XTemplate准备好后将执行这个方法，以便自动执行一些绑定函数等。
    x.ready = function (callback) {
        if (!x.isInit) {
            if (typeof callback === 'function') {
                x.callback = callback;
            }
        } else {
            if (typeof callback === 'function') {
                x.callback = callback;
                x.callback();
            }
        }
    };
    /**
     * 初始化
     */
    x.init = function () {
        if (!x.isInit) {
            x.isInit = true;
            r.init();
            if (x.callback) {
                x.callback();
            }
        }
    };
    /**
     * 取url的参数，并可以指定默认值
     *
     * 示例：
     *
     * 1. query('id')，取url参数中的id的值
     * 2. query('id',10)，取url参数中的id的值，如果id为空值，就返回默认值10
     *
     * @method query
     * @param key {string} 参数名
     * @param defaultValue [可选] 默认值
     */
    x.query = function (key, defaultValue) {
        if (!w.query_args) {
            w.query_args = r.util.getUrlQuery();
        }
        var tmp = w.query_args[key];
        if (typeof tmp == 'undefined' || tmp === '') {
            return defaultValue;
        }
        return tmp;
    };

    /**
     * 将Render.util工具函数集合引入XTemplate，方便后续使用。具体内容见{{#crossLink "Render.util"}}{{/crossLink}}。
     * @property util
     * @type {Object}
     */
    x.util = r.util;
    /**
     * 使用ajax加载数据，可选的绑定到页面。
     * 支持2类数据，Object和Array。
     *
     * Object为简单绑定，页面中在需要绑定数据的地方用data-bind指定属性名。
     * 当绑定id为空串时，在绑定时直接使用属性名，例：{key:'key1'}，绑定时只需key即可。
     *
     * 示例：
     *
     *     <p data-bind='key'></p>
     *
     * 当指定绑定id时，在绑定时需要在属性名前加上指定的名称，例：{key:'key1'}，名称为data1,绑定时需data1.key
     *
     * 示例：
     *
     *     <p data-bind='data1.key'></p>
     *
     *
     * Array为循环绑定，常用于输出列表，页面中用data-repeat-name指定绑定名。
     * 在使用data-repeat-name后，该节点内部的html内容将成为模板，循环绑定后显示。
     *
     * 示例：
     *
     *     <ul data-repeat-name='data'>
     *         <li>{key}</li>
     *     </ul>
     *
     * 如果Array的内容为[{key:'key1'},{key:'key2'},{key:'key3'}]，输出内容为
     *
     *     <ul data-repeat-name='data'>
     *         <li>key1</li>
     *         <li>key2</li>
     *         <li>key3</li>
     *     </ul>
     *
     * @method load
     * @param  id {string} 绑定id，在html页面中指定
     * @param  postUrl {string} url地址，该地址返回一段json数据
     * @param param 请求的参数，可为空。如果为空是自动使用当前页面地址的query参数
     *
     * 示例：如果当前页面的地址为show.html?id=132，param为''时，系统会将param修改为{id:132}，内容与当前页的参数一致。
     *
     * @param dataFilter {Function} 数据过滤方法，如果请求的数据正常，就返回可以绑定的数据；如果返回false，将不执行绑定。
     *
     * 示例：其中e为从postUrl中取得的json数据
     *
     *     function(e){
     *        if(e.error==0){
     *            return e.data;
     *        }else{
     *            return false;
     *        }
     *     }
     *
     * @param callback {Function} [可选] 请求成功的回调方法
     *
     * 示例：其中e为从postUrl中取得的json数据
     *
     *      function(e){
     *          alert('ok');
     *      }
     *
     * @param errorback {Function} [可选] 请求失败的回调方法
     *
     * 示例：
     *
     *     function(){
     *          alert('error');
     *     }
     *
     */
    x.load = function (id, postUrl, param, dataFilter, callback, errorback) {
        var opt = {};
        opt.url = postUrl;
        if (param === '' || typeof param == 'undefined') {
            param = r.util.getUrlQuery();
        }
        opt.data = param;
        opt.type = 'POST';
        if (errorback) {
            opt.error = errorback;
        } else if (x.error_callback) {
            opt.error = x.error_callback;
        } else {
            opt.error = function (data, status) {
                console.log(data, status);
            };
        }
        opt.success = function (data) {
            if (typeof data === 'string') {
                /* jshint ignore:start */
                data = eval('(' + data + ')');
                /* jshint ignore:end */
            }
            var ok = !!data;
            if (x.checkData) {
                if (!x.checkData(data)) {
                    ok = false;
                }
            }
            if (ok && dataFilter) {
                data = dataFilter(data);
                if (!data) {
                    ok = false;
                }
            }
            if (ok) {
                if (r.util.isArray(data)) {
                    r.bindRepeatData(id, data);
                } else {
                    if (id) {
                        r.bindData(id, data);
                    } else {
                        r.bindData(data);
                    }
                }
            }
            if (callback) {
                callback(ok, data);
            }
        };
        if (x.isInit) {
            if (x.optAjax) {
                x.optAjax.ajax(opt);
            } else {
                $.ajax(opt);
            }
        }
    };
    /**
     * 设置ajax类，默认为jQuery
     * @method setAjax
     * @param ajax ajax工具类
     */
    x.setAjax = function (ajax) {
        this.optAjax = ajax;
    };
    var testReady = function () {
        if (/complete|loaded|interactive/.test(document.readyState) && document.body) {
            x.init();
            return true;
        }
        return false;
    };
    var timeReady = function () {
        if (!testReady()) {
            setTimeout(timeReady, 5);
        }
    };
    //开始初始化将执行ready方法
    if (!testReady()) {
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', function () {
                testReady();
            }, false);
        } else {
            setTimeout(timeReady, 5);
        }
    }
})(document, window, window.XTemplate = {},window.Render);