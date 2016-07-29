/**
 * @file section.js
 * @author hefeng
 *
 * 输入内容区域
 */

var PhoneInput = require('common/ui/phoneInput/phoneInput');
var tpl = require('./input.tpl');

function Section(options) {
    this.opts = {
        wrapper: '#plan-content',
        addInput: '.add-main',
        page: null,
        phoneInputs: []
    };

    $.extend(this.opts, options);

    this.page = this.opts.page;
    this.$wrapper = $(this.opts.wrapper);

    if (!this.page || !this.$wrapper) {
        return;
    }

    this.init();
}

$.extend(Section.prototype, {
    init: function () {
        var me = this;
        me.page.render(me.opts.wrapper, {}, {
            type: 'append'
        });

        var $input = $('.phone-input');
        $.each($input, function (index, item) {
            me.opts.phoneInputs.push(me.initInput());
        });
        me.bindEvents();
    },

    initInput: function () {
        return new PhoneInput({
            handler: '.phone-input',
            input: '.phone-input-main',
            section: '.section-content',
            limit: 50,
            delete: true
        });
    },

    addInput: function (dom) {
        var me = this;
        var html = me.page.render(null, {}, {
            tmpl: tpl
        });
        $(dom).before(html);
        me.opts.phoneInputs.push(me.initInput());
    },

    bindEvents: function () {
        var me = this;
        me.$wrapper.on('click', me.opts.addInput, function () {
            me.addInput(this);
        })
    }
});

module.exports = Section;
