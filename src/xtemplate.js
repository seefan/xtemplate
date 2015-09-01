(function (d, r, x, $) {
    x.isInit = false;
    x.ready = function (callback) {
        if (!x.isInit) {
            if (typeof callback === 'function') {
                x.callback = callback;
            }
        } else {
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
    /**
     * 加载数据
     * @param id
     * @param postUrl
     * @param param
     * @param callback
     * @param errorback
     */
    x.load = function (id, postUrl, param, callback, errorback) {
        var opt = {};
        opt.id = id;
        opt.url = postUrl;
        opt.data = param;
        if (errorback) {
            opt.error = errorback;
        }
        opt.callback = callback;
        opt.success = function (data) {
            var val = opt.callback(data);
            if (toString.apply(val) == "[object Array]") {
                r.bindRepeatData(val, opt.id);
            } else {
                r.bindData(val);
            }
        }
        if (x.isInit) {
            $.ajax(opt);
        }
    }
    if (d.readyState === 'complete') {
        x.init();
    } else {
        d.onreadystatechange = function () {
            if (d.readyState === 'complete') {
                x.init();
            }
        };
    }
})(document, window.Render, window.XTemplate = {}, window.jQuery);