/**
 * @file filter.js
 * @author hefeng
 *
 * 过滤组件
 */

var Control = require('common/control');
var filterTpl = require('./filter.tpl');


function Filter(selector, options) {
    if (!selector) {
        return;
    }
    Control.call(this, options);

    this.opts = {
        menuData: {},
        menuCurr: 'current-menu',
        itemCurr: 'current-item',
        itemClass: '.menu-item',
        tpl: filterTpl,
        wrapper: selector
    }

    $.extend(this.opts, options);
    this.$wrap = $(selector);
    this.init();
}

$.extend(Filter.prototype, Control.prototype);

$.extend(Filter.prototype, {
    init: function () {
        var me = this;
        var data = me.opts.menuData;
        me.render(data);

        this.$menu = this.$wrap.find('.filter-menu');
        this.$main = this.$wrap.find('.menu-inner');

        me.bindEvents();
    },
    bindEvents: function () {
        var me = this;
        var opts = me.opts;

        me.$menu.on('click', function () {
            var isCurrent = $(this).hasClass(opts.menuCurr);
            if (isCurrent) {
                $(this).removeClass(opts.menuCurr);
            }
            else {
                me.$menu.removeClass(opts.menuCurr);
                $(this).addClass(opts.menuCurr);
            }
        });

        me.$main.on('click', opts.itemClass, function (e) {
            e.stopPropagation();
            e.preventDefault();

            $(this).siblings('.' + opts.itemCurr).removeClass(opts.itemCurr);
            $(this).addClass(opts.itemCurr);
        });
    }
});

module.exports = Filter;