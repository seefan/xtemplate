/**
 * 在指定对象平级附加一个对象
 * @param newEl
 * @param targetEl
 */
function insertAfter(newEl, targetEl) {
    var parentEl = targetEl.parentNode;
    if (!parentEl) {
        return;
    }
    if (parentEl.lastChild == targetEl) {
        parentEl.appendChild(newEl);
    } else {
        parentEl.insertBefore(newEl, targetEl.nextSibling);
    }
}
/**
 * 取下一个节点
 * @param ele
 * @returns {*}
 */
function getNextSibling(ele) {
    if (ele.nextElementSibling && ele.nextElementSibling.tagName == ele.tagName) {
        return ele.nextElementSibling;
    } else {
        return false;
    }
}
/**
 * 给指定对象设置值
 * @param ele
 * @param value
 */
function setValue(ele, value) {
    switch (ele.tagName) {
        case 'INPUT':
            ele.value = value;
            break;
        default:
            ele.innerText = value;
            break;
    }

}

/**
 * 取扁平的字典值
 * @param key
 * @param data
 * @returns {*}
 */
function getNameValue(key, data) {
    var value = data[key];
    var type = typeof value;
    if (type == 'string' || type == 'number') {
        return [[key, value]];
    } else {
        var names = [];
        for (var k in value) {
            var tkv = getNameValue(k, value);
            for (var i = 0; i < tkv.length; i++) {
                names.push([key + '.' + tkv[i][0], tkv[i][1]]);
            }
        }
        return names;
    }
}
/**
 * 取数组的key全集
 * @param key
 * @param data
 * @returns {*}
 */
function getName(key, data) {
    var value = data[key];
    var type = typeof value;
    if (type == 'string' || type == 'number') {
        return [key];
    } else {
        var names = [];
        for (var k in value) {
            var tkv = getName(k, value);
            for (var i = 0; i < tkv.length; i++) {
                names.push(key + '.' + tkv[i]);
            }
        }
        return names;
    }
}
/**
 * 是否有指定串开头
 * @param str
 * @param startString
 */
function startWith(str, startString) {
    if (str && startString && str.length > startString.length && str.substr(0, startString.length) == startString) {
        return true;
    } else {
        return false;
    }
}
/**
 * 是否为数字
 * @param chars
 * @returns {boolean}
 */
function isNumber(chars) {
    var re = /^(-?\d+)(\.\d+)?/;
    return chars.match(re) != null;
}

/**
 * 取指定数组的值
 * @param key
 * @param data
 * @returns {*}
 */
function getValue(key, data) {
    var keys = key.split('.'), result = data[keys.shift()];
    for (var i = 0; result && i < keys.length; i++) {
        result = result[keys[i]];
    }
    if (result) {
        return result;
    } else {
        return '';
    }
}