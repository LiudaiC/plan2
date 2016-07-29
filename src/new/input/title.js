/**
 * @file title.js
 * @author hefeng
 *
 * 新建计划的title处理
 */
var lang = require('common/lang').getData();

function Title(options) {
    this.opts = {
        input: null,
        wrap: null,
        placeholderTpl: '<span class="placeholder">(' + lang.mustWrite + ')</span>',
        limitsTpl: '<span class="limits"></span>',
        maxNumber: 45
    };

    $.extend(this.opts, options);
    this.$input = this.opts.input;
    this.$wrap = this.opts.wrap;
    if (!this.$input || !this.$wrap) {
        return;
    }
    this.init();
}

$.extend(Title.prototype, {

    /**
     * 初始化title
     *
     */
    init: function () {
        var me = this;
        me.addDom();
        me.bindEvents();
        me.$input.triggerHandler('input');
    },

    /**
     * 添加dom
     *
     */
    addDom: function () {
        var me = this;
        var opts = me.opts;
        var tpl = opts.placeholderTpl + opts.limitsTpl;
        me.$wrap.append(tpl);
        me.$placeholder = me.$wrap.find('.placeholder');
        me.$limits = me.$wrap.find('.limits');
    },

    /**
     * placeholder的展示和隐藏
     *
     * @param {boolean} isShow, 是否展示
     * @param {boolean} isLight, 是否高亮
     */
    placeholder: function (isShow, isLight) {
        var me = this;
        if (isLight) {
            me.$placeholder.addClass('light');
        }
        else {
            me.$placeholder.removeClass('light');
        }
        if (isShow) {
            me.$placeholder.removeClass('hide');
        }
        else {
            me.$placeholder.addClass('hide');
        }
    },

    /**
     * 根据输入改变字数提示
     *
     */
    changeLimits: function () {
        var me = this;
        var value = $.trim(me.$input.val());
        var length = value.length;
        var text = '(' + length + '/' + me.opts.maxNumber + ')';
        me.$limits.text(text);
    },

    /**
     * limit的展示和隐藏
     *
     * @param {boolean} isShow, 是否展示
     */
    limits: function (isShow) {
        var me = this;
        if (isShow) {
            me.changeLimits();
            me.$limits.removeClass('hide');
        }
        else {
            me.$limits.addClass('hide');
        }
    },

    /**
     * 输入状态改变的处理
     *
     */
    changeStatus: function () {
        var me = this;
        var value = $.trim(me.$input.val());
        if (!value) {
            me.placeholder(true, false);
            me.limits(false);
        }
        else {
            me.placeholder(false, false);
            me.limits(true);
        }
    },

    /**
     * 事件
     *
     */
    bindEvents: function () {
        var me = this;
        me.$input
            .on('input', function () {
                me.changeStatus();
            });
    },

    /**
     * 是否能提交
     *
     * @return {boolean} 是否可以提交
     */
    canSubmit: function () {
        var me = this;
        var length = $.trim(me.$input.value).length;
        var isCan = length && (length <= me.opts.maxNumber);
        return isCan;
    }
});

module.exports = Title;
