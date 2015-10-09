(function (d, w, x) {
    'use strict';
    var r = w.Render;
    //是否已初始化
    x.isInit = false;
    //是否使用其它的ajax方法，默认使用jquery
    x.optAjax = false;
    //准备方法，XTemplate的入口方法，XTemplate准备好后将执行这个方法，以便自动执行一些绑定函数等。
    x.ready = function (callback, reload) {
        if (!x.isInit) {
            if (typeof callback === 'function') {
                x.callback = callback;
            }
        } else {
            if (reload) {
                r.init(document.all);
            }
            if (typeof callback === 'function') {
                x.callback = callback;
                x.callback();
            }
        }
    };
    //初始化
    x.init = function () {
        if (r) {
            r.init(d.all);
            x.isInit = true;
            if (x.callback) {
                x.callback();
            }
        }
    };
    /**
     * 取url的参数，并可以指定默认值
     * @param key 参数名
     * @oaram defaultValue 默认值，可选
     */
    x.query = function (key, defaultValue) {
        if (!w.query_args) {
            w.query_args = r.util.getUrlQuery();
        }
        var tmp = w.query_args[key];
        if (!tmp) {
            return defaultValue;
        }
        return tmp;
    };
    //绑定工具
    x.util = r.util;
    /**
     * 使用ajax加载数据
     * @param id 绑定的id，可以为空。
     * @param postUrl       请求数据的url
     * @param param         请求的参数，可为空
     * @param backdata      数据处理方法，如果请求的数据正常，就返回可以绑定的数据；如果出错就返回false，将不执行绑定。
     * @param callback      请求成功的回调方法，可为空
     * @param errorback     请求失败的回调方法，可为空
     */
    x.load = function (id, postUrl, param, backdata, callback, errorback) {
        var opt = {};
        opt.url = postUrl;
        opt.data = param;
        opt.type = 'POST';
        if (errorback) {
            opt.error = errorback;
        } else if (x.error_callback) {
            opt.error = x.error_callback;
        } else {
            opt.error = function (data, status) {
                console.log(status);
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
            if (ok && backdata) {
                data = backdata(data);
                if (!data) {
                    ok = false;
                }
            }
            if (ok) {
                if (toString.apply(data) == "[object Array]") {
                    r.bindRepeatData(data, id);
                } else {
                    if (id) {
                        r.bindData(data, id);
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
     * 设置ajax类，默认为jquery
     * @param ajax
     */
    x.setAjax = function (ajax) {
        this.optAjax = ajax;
    };
    //开始初始化将执行ready方法
    if (d.readyState === 'complete') {
        x.init();
    } else {
        d.onreadystatechange = function () {
            if (d.readyState === 'complete') {
                x.init();
            }
        };
    }
})(document, window, window.XTemplate = {});