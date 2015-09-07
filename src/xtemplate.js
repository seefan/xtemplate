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
                r.init(d.all);
            }
            callback();
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
            if (x.checkData) {
                if (!x.checkData(data)) {
                    return;
                }
            }
            if (backdata) {
                data = backdata(data);
                if (!data) {
                    return;
                }
            }
            if (toString.apply(data) == "[object Array]") {
                r.bindRepeatData(data, id);
            } else {
                if (id) {
                    r.bindData(data, id);
                } else {
                    r.bindData(data);
                }
            }
            if (callback) {
                callback(data);
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