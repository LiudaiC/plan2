/**
 * @file phoneInput.js
 * @author deo
 *
 * 模拟手机端输入框
 */
require('./phoneInput.scss');

var Control = require('common/control');
var util = require('common/util');

/**
 * 替换表情
 *
 * @param {string} str, 字符串
 * @return {string} 替换后的字符串
 */
function formateEmoji(str) {
    if (!str || typeof str !== 'string') {
        return '';
    }
    return str.replace(/[\ud800-\udbff][\udc00-\udfff]/g, '[表情]');
}

/**
 * 模拟输入框
 *
 * @param {Ojbect} options, 配置项
 */
var PhoneInput = function (options) {

    Control.call(this, options);

    var me = this;
    /* eslint-disable */
    me.opts = {
        secIndex: 0,
        inputIndex: 0,
        wrapper: '',
        handler: '.phone-input',
        input: '.phone-input-main',
        inputWrapper: '',

        limit: false,

        button: false,

        delete: false,

        selector: {
            placeholder: '.phone-input-placeholder',
            limit: '.phone-input-limit',
            delete: '.phone-input-delete'
        },

        phoneInputs: {}
    };
    /* eslint-enable */
    $.extend(me.opts, options);

    if (me.opts.detail) {
        me.opts.wrapper += '-' + me.opts.secIndex;
        me.opts.handler = me.opts.wrapper + ' ' + me.opts.handler + '-' + me.opts.inputIndex;
        me.opts.input = me.opts.wrapper + ' ' + me.opts.input + '-' + me.opts.inputIndex;
        me.opts.inputWrapper = me.opts.wrapper + ' ' + me.opts.inputWrapper + '-' + me.opts.inputIndex;
    }

    // 外层
    me.$main = $(me.opts.handler);

    // 实际输入框
    me.$input = me.$main.find(me.opts.input);

    if (me.opts.detail) {
        me.$inputWrapper = me.$main.parents(me.opts.inputWrapper);
    }

    me._isEdit = false;
    me._defval = me.$input.html();

    me.init();
};

var controlItem = '.phone-input-item';

$.extend(PhoneInput.prototype, Control.prototype);

$.extend(PhoneInput.prototype, {

    /**
     * 添加一些必须的dom 或者属性
     */
    init: function () {

        this.placeholder = this.$input.data('placeholder');
        this.name = this.$input.data('name');
        this.value = '';
        // 用于存放一些非必需的 elements
        this.elems = {};

        this.addDom();
        this.bindEvents();

        this.inputStatusChange();
    },

    /**
     * 根据配置项，获取 dom 节点
     *
     * @return {string}
     */
    getDom: function () {
        var domClass = {};
        var selector = this.opts.selector;
        for (var key in selector) {
            if (selector.hasOwnProperty(key)) {
                domClass[key] = selector[key].replace(/^\./, '');
            }
        }

        var itemClass = controlItem.replace(/^\./, '');

        var htmlStr = '';

        // DOM place holder
        if (this.placeholder) {
            htmlStr += '<div class="' + itemClass + ' ' + domClass.placeholder + '">' + this.placeholder + '</div>';
        }

        // DOM limit
        if (this.opts.limit) {
            htmlStr += '<div class="' + itemClass + ' ' + domClass.limit + '"></div>';
        }

        // DOM button wrapper
        if (this.opts.button) {
            htmlStr += '<div class="phone-input-buttons"></div>';
        }

        // DOM button wrapper
        if (this.opts.delete) {
            htmlStr += '<div class="phone-input-delete"></div>';
        }

        return htmlStr;
    },

    /**
     * 添加 dom
     */
    addDom: function () {
        var html = this.getDom();
        var selector = this.opts.selector;

        this.$main.append(html);

        for (var key in selector) {
            if (selector.hasOwnProperty(key)) {
                this.elems['$' + key] = this.$main.find(selector[key]);
            }
        }
    },

    /**
     * 输入框字符长度
     *
     * @return {number}
     */
    getLength: function () {
        var content = this.$input.html();
        content = $.trim(util.formatRichText(formateEmoji(content)));
        return content.length;
    },

    /**
     * 输入框字符长度为空
     *
     * @return {boolean}
     */
    isNull: function () {
        return this.getLength() <= 0;
    },

    /**
     * 输入框字符长度不为空
     *
     * @return {boolean}
     */
    isNotNull: function () {
        return this.getLength() > 0;
    },

    /**
     * 输入框字符长度不为空
     *
     * @return {boolean}
     */
    isOutLimit: function () {
        return this.getLength() > this.opts.limit;
    },

    /**
     * 超出限制的字符数
     *
     * @return {number}
     */
    outStringNum: function () {
        var num = this.opts.limit - this.getLength();
        return num >= 0 ? 0 : num;
    },

    /**
     * 输入状态的dom 状态变化
     */
    inputStatusChange: function () {
        var me = this;

        var isNull = me.isNull();
        var isNotNull = me.isNotNull();
        var isOutLimit = me.isOutLimit();

        if (isNull) {
            me.displayer('placeholder').show();
            me.displayer('limit').hide();
        }

        if (isNotNull) {
            me.displayer('placeholder').hide();
        }

        // 隐藏 placeholder
        if (isNotNull && !isOutLimit) {
            me.displayer('placeholder').hide();
        }

        // 超过字数限制
        if (isOutLimit) {
            me.displayer('limit').show(me.outStringNum());
            me.$main.attr('status', 'unable');
        }
        else {
            me.displayer('limit').hide(me.outStringNum());
            me.$main.attr('status', 'enable');
        }
    },

    /**
     * events
     */
    bindEvents: function () {
        var me = this;

        me.$input
            .on('click', function () {
                event.preventDefault();
                event.stopPropagation();

                // 隐藏 placeholder
                if (me.isNotNull() && !me.isOutLimit()) {
                    me.displayer('placeholder').hide();
                }
            })

            // 输入状态
            .on('input', function (event) {
                me.inputStatusChange();

                var curval = $(this).html();

                if (curval !== me._defval) {
                    me._isEdit = true;
                }
                else {
                    me._isEdit = false;
                }

                me.fire('inputset');
            })

            // 关闭
            .on('blur', function () {
                if (me.isNull()) {
                    me.displayer('placeholder').show();
                }
            });

        // 删除按钮
        me.elems.$delete
            .on('click', function (e) {
                var dom = $(this).parents(me.opts.inputWrapper);
                me._isEdit = true;
                me.destroy(dom);
            });
    },

    /**
     * 对各种元素进行展示逻辑
     *
     * @param {string} selectorKey, selector 对应的 key， 被绑定在 this.elems 节点上
     * @return {Object} 返回 show(), hide()
     */
    displayer: function (selectorKey) {
        var $elem = this.elems['$' + selectorKey];

        if (!$elem.length) {
            return {
                show: function () {},
                hide: function () {}
            };
        }

        return {

            /**
             * 展示元素
             *
             * @param {string|Function} html, html 字符串或者 function
             */
            show: function (html) {
                $elem.removeClass('hide');
                if (html) {
                    $elem.html(html);
                }
            },

            /**
             * 展示元素
             *
             * @param {string|Function} html, html 字符串或者 function
             */
            hide: function (html) {
                $elem.addClass('hide');
                if (html) {
                    $elem.html(html);
                }
            }
        };
    },

    /**
     * 判断当前的输入框是否能提交
     *
     * @return {string}
     */
    isAllowSubmit: function () {
        var status = this.$main.attr('status');
        return status === 'unable' ? 0 : 1;
    },

    /**
     * 判断当前的输入框是否编辑过
     *
     * @return {boolean}
     */
    isEdited: function () {
        return this._isEdit;
    },

    /**
     * 判断当前分类是否只有一个细则
     *
     * @return {boolean}, 是否是唯一
     */
    isOnly: function () {
        var me = this;
        var isOnly = true;
        var n = 0;
        var curr = me.opts.phoneInputs[me.opts.secIndex];
        for (var k in curr) {
            if (curr.hasOwnProperty(k)) {
                n++;
                if (n === 2) {
                    isOnly = false;
                    break;
                }
            }
        }
        return isOnly;
    },

    /**
     * destroy
     *
     * @param {element} dom, 需要删除的dom节点
     */
    destroy: function (dom) {
        var me = this;
        var phoneInputs = me.opts.phoneInputs;
        var isOnly = me.isOnly();
        if (isOnly && (me.opts.secIndex !== 0)) {
            $(me.opts.wrapper).remove();
            delete phoneInputs[me.opts.secIndex];
        }
        else {
            dom.remove();
            delete phoneInputs[me.opts.secIndex][me.opts.inputIndex];
        }
    }
});

module.exports = PhoneInput;
