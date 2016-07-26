/**
 * @file fix-ios.js
 * @author deo
 *
 * Fix ios bugs +,+
 */

var exports = {};

var $window = $(window);

/**
 * 修正 fixed 到底部的输入框在 IOS 中的 bug
 */
exports.thirdkeyboard = {

    // 延迟执行键盘弹出后的输入框置地动画 timer id
    delayTimerId: null,

    // 动画 timer id
    animateTimerId: null,

    listenTimerId: null,

    /**
     * 弹开键盘之前的滚动条高度
     * @param {number}
     */
    beforeOpenTop: 0,

    /**
     * 每次移动的步长, @default 40
     * @param {number}
     */
    step: 40,

    /**
     * interval 执行间隔
     * @param {number}
     */
    timeStep: 13,

    /**
     * 打开键盘的修正代码
     *
     * @param {Element} $inputLayout, 输入框的外层容器
     */
    open: function ($inputLayout) {
        var me = this;
        var realHeight = document.body.scrollHeight;
        var inputLayoutHeight = $inputLayout.height();
        var startTop = realHeight - inputLayoutHeight - $window.height();

        me.beforeOpenTop = window.scrollY;

        me.step = Math.floor(Math.abs(realHeight - startTop) / me.timeStep);

        // 这一步很关键，为了 IOS 第三方键盘也要可以置底，需要把本身的 fixed 属性改为 absolute
        // 并且在后面的 setTimeout 中重新设置 top
        $inputLayout.css({
            position: 'absolute'
        });

        // 修正
        clearTimeout(me.delayTimerId);
        me.delayTimerId = setTimeout(function () {

            // 如果内容高度小于屏幕可视高度
            // 则不再进行动画处理
            if (realHeight <= $window.height()) {
                $window.scrollTop(realHeight);
                return;
            }

            // 这一步也很重要，为了可爱的第三方键盘，只能改变原生键盘的行为，把置顶重新修正到 xx 位置
            $window.scrollTop(startTop);

            // 先把该容器放置在整个 layout 的底部
            $inputLayout.css({
                top: realHeight - inputLayoutHeight
            });

            me.animate(startTop, realHeight);
        }, 0);
    },

    /**
     * 关闭键盘
     *
     * @param {Element} $inputLayout, 输入框的外层容器
     */
    close: function ($inputLayout) {

        // 键盘收起来之后，滚动回展开前的位置
        $window.scrollTop(this.beforeOpenTop);

        // 恢复
        $inputLayout.css({
            position: 'fixed',
            top: 'auto',
            bottom: 0
        });
    },

    /**
     * 弹出输入框的动画效果
     *
     * @param {number} startTop, 滚动动画开始位置
     * @param {number} realHeight, 页面整个的实际高度
     */
    animate: function (startTop, realHeight) {
        var me = this;

        clearInterval(me.listenTimerId);

        if (startTop >= realHeight) {
            clearInterval(me.animateTimerId);
            $window.scrollTop(realHeight);
            return;
        }

        me.animateTimerId = setInterval(function () {
            $window.scrollTop(startTop);

            startTop = startTop + me.step;

            if (startTop >= realHeight) {
                clearInterval(me.animateTimerId);
            }
        }, me.timeStep);

        me.listenTimerId = setTimeout(function () {
            clearInterval(me.animateTimerId);
        }, 500);
    }
};

module.exports = exports;
