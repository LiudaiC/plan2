/**
 * @file virtualInput.js
 * @author deo
 *
 * 虚拟输入框
 * 将被废弃，暂用
 */
require('dep/touch');
// var fixIOS = require('common/ui/fix-ios');
// var util = require('common/util');

var virtualInput = function (selector, options) {

    this.opts = {
        maxNum: 6000
    };

    this.timerId = null;
    $.extend(this.opts, options);

    this.$wrap = $(selector);
    this.$parent = $('#comment-input-wrapper');
    // this.$shadow = $('#goalui-fixedinput-shadow');
    this.$placeholder = this.$wrap.find('.placeholder');
    this.$button = this.$wrap.find('.button');
    this.$send = this.$wrap.find('.send');
    this.$limit = this.$wrap.find('.limit');
    this.editor = '.editable';
    this.attachBtn = '#addAttach';
    this.attachList = '#attachList';
    this.$attachList = $(this.attachList);
    // this.winHeight = $(window).height();
    this.bindEvents();
};

virtualInput.prototype = {

    sendStatus: function () {
        var me = this;
        var text = $.trim($(me.editor).val());

        if (text.length > me.opts.maxNum) {
            var limitNum = me.opts.maxNum - text.length;
            me.$limit.html(limitNum).removeClass('hide');
            me.$send.addClass('unable');
            me.$send.data({toLong: true});
        }
        else {
            me.$limit.html('').addClass('hide');
            if (me.$send.data('isAttachesReady')) {
                me.$send.removeClass('unable');
            }
            me.$send.data({toLong: false});
        }

        if (!text.length) {
            me.$placeholder.removeClass('hide');
            if (me.$send.data('attach')) {
                if (me.$send.data('isAttachesReady')) {
                    me.$send.removeClass('unable');
                }
            }
            else {
                me.$send.addClass('unable');
            }
            me.$send.data({notNull: false});
        }
        else {
            me.$placeholder.addClass('hide');
            me.$send.data({notNull: true});
        }
    },

    reset: function () {
        var me = this;
        $(me.editor).val('');
        me.$wrap.removeClass('extend');
        me.$placeholder.removeClass('hide');
        me.$parent.removeClass('extend');
        me.$limit.addClass('hide');
        $(me.editor).blur();
        me.$send.data({notNull: false});
        me.$send.data({toLong: false});
    },

    // 小化评论输入框
    pullDown: function () {
        var me = this;
        me.$parent.removeClass('extend');
        me.$wrap.removeClass('extend');
        me.$attachList.addClass('hide');
        $(me.editor).blur();
    },

    // 该方法会导致ios上点击输入框，输入框弹上去，已用其他方法解决 ios fixed兼容性问题
    // stopScroll: function () {

    //     // 解决弹出键盘后，遮罩被拖动导致输入位置移位
    //     $('#comment-input-wrapper').on('touchmove.virtual', function (event) {
    //         event.preventDefault();
    //         event.stopPropagation();
    //     });
    //     $('#goalui-fixedinput-shadow').on('touchmove.virtual', function (event) {
    //         event.preventDefault();
    //         event.stopPropagation();
    //     });
    // },

    // 解决第三方的输入法会导致自带的输入法弹起评论框位置不正确
    // /**
    //  * 解决第三方输入法弹出键盘，fixed的评论框不能上浮的问题
    //  *
    //  */
    // fixInput: function () {
    //     var me = this;
    //     var nowWinHeight = $(window).height();
    //     var height = me.winHeight - nowWinHeight;
    //     var scrollTop = $(window).scrollTop();
    //     $(window).scrollTop(scrollTop + height - 172);
    // },

    bindEvents: function () {
        var me = this;
        // var $outter = $('#comment-input-wrapper');
        var $btnBox = $('#comment-input-wrapper .button-wrap');

        // me.stopScroll();

        me.$wrap
            // 弹出输入框
            .on('click', me.editor, function (event) {
                event.preventDefault();
                event.stopPropagation();

                me.$parent.addClass('extend');
                me.$wrap.addClass('extend');

                me.$attachList.addClass('hide');
                me.sendStatus();

                // 非苹果 不做 fix
                // if (util.isApple()) {
                //     fixIOS.thirdkeyboard.open(me.$parent);
                // }
            })
            // 输入
            .on('input', me.editor, function () {
                me.sendStatus();
            })
            // 关闭
            .on('blur', me.editor, function () {
                if (!$.trim($(this).val())) {
                    me.$placeholder.removeClass('hide');
                }
            });

        $(me.attachBtn).on('touchstart', function (e) {
            me.$parent.addClass('extend');
            me.$wrap.addClass('extend');
            e.stopPropagation();
            $(me.attachBtn).triggerHandler('tap');
            $(me.editor).blur();
            clearTimeout(me.timerId);

            // 为了安卓上软键盘收起来时，只有输入框好看些，等到软键盘收起来再展开附件列表
            me.timerId = setTimeout(function () {
                me.$attachList.removeClass('hide');
            }, 500);
            me.sendStatus();
        });

        // @hefeng
        // touchstart才能让遮罩跟着软键盘下拉，在ios上才不会出现很大一坨背景
        me.$parent.on('touchstart', function (e) {
            var target = e.target;

            // 点击遮罩和输入框外围区域关闭键盘
            if (target === this || target === me.$wrap[0]) {
                e.preventDefault();
                e.stopPropagation();
                me.pullDown();

                // if (util.isApple()) {
                //     fixIOS.thirdkeyboard.close(me.$parent);
                // }
            }
        });

        // 点击评论框下面灰色区域展示附件列表
        $btnBox.on('touchstart', function (e) {
            var target = e.target;
            if (target === this) {
                e.preventDefault();
                e.stopPropagation();

                clearTimeout(me.timerId);

                // 为了安卓上软键盘收起来时，只有输入框好看些，等到软键盘收起来再展开附件列表
                me.timerId = setTimeout(function () {
                    me.$attachList.removeClass('hide');
                }, 500);

                // 失去焦点，收缩软键盘
                $(me.editor).blur();
            }
        });

        // 为了软键盘下拉时页面不会拉出很大坨背景，
        // 需要touchstart就跟着把遮罩下拉, 所以只有用triggerHandler触发提交
        me.$send.on('touchstart', function (e) {
            e.preventDefault();
            e.stopPropagation();
            // me.pullDown();
            $(this).triggerHandler('tap');
        });
    }
};

module.exports = virtualInput;
