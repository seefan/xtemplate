(function (d, w, x) {
    'use strict';
    var r = w.Render;
    x.isInit = false;
    x.optAjax = false;
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
    x.init = function () {
        if (r) {
            r.init(d.all);
            x.isInit = true;
            if (x.callback) {
                x.callback();
            }
        }
    };
    //参数
    x.query = function (key) {
        if (!w.query_args) {
            w.query_args = r.util.getUrlQuery();
        }
        return w.query_args[key];
    };
    //绑定工具
    x.util = r.util;
    /**
     * 加载数据
     * @param id
     * @param postUrl
     * @param param
     * @param callback
     * @param errorback
     */
    x.load = function (id, postUrl, param, backdata, callback, errorback) {
        var opt = {};
        opt.url = postUrl;
        opt.data = param;

        if (errorback) {
            opt.error = errorback;
        } else if (x.error_callback) {
            opt.error = x.error_callback;
        }

        opt.success = function (data) {
            var ok = true;
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
                callback(ok);
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