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
        addSection: '#addSection',
        closeSection: '.section-colse',
        input: '.phone-input',
        section: '.plan-content-section',
        content: '.section-content',
        page: null,
        phoneInputs: {},
        data: null
    };

    $.extend(this.opts, options);

    this.page = this.opts.page;
    this.$wrapper = $(this.opts.wrapper);
    this.$addSection = $(this.opts.addSection);

    if (!this.page || !this.$wrapper) {
        return;
    }

    this.init();
}

$.extend(Section.prototype, {
    init: function () {
        var me = this;
        me.page.render(me.opts.wrapper, me.opts.data, {
            type: 'append'
        });
        var $section = $(me.opts.section);
        var $input = null;
        $.each($section, function (index, item) {
            $input = $(item).find(me.opts.input);
            var i = $(item).data('index');
            var obj = {};
            $.each($input, function (ind, ite) {
                obj[ind] = me.initInput(index, ind);
            });
            me.opts.phoneInputs[i] = obj;
        });
        me.bindEvents();
    },

    getCurrSectionIndex: function (addDom) {
        var me = this;

        var $section = $(addDom).parents(me.opts.section);
        var index = $section.data('index');
        return index === undefined ? 0 : index;
    },

    getNewInputIndex: function (addDom) {
        var me = this;
        var $section = $(addDom).parents(me.opts.section);
        var $content = $section.find(me.opts.content);
        var $last = $content.last();
        var index = $last.data('index');
        return index === undefined ? 0 : index + 1;
    },

    getNewSectionIndex: function () {
        var me = this;
        var $last = $(me.opts.section).last();
        var index = $last.data('index');
        return index === undefined ? 0 : index + 1;
    },

    initInput: function (secIndex, inputIndex) {
        var me = this;
        return new PhoneInput({
            'detail': true,
            'secIndex': secIndex,
            'inputIndex': inputIndex,
            'wrapper': me.opts.section,
            'handler': '.phone-input',
            'input': '.phone-input-main',
            'inputWrapper': '.section-content',
            'limit': 50,
            'delete': true,
            'phoneInputs': me.opts.phoneInputs
        });
    },

    addInput: function (addDom) {
        var me = this;
        var index = me.getNewInputIndex(addDom);
        var currIndex = me.getCurrSectionIndex(addDom);
        var html = me.page.render(null, {contentIndex: index}, {
            tmpl: tpl
        });
        $(addDom).before(html);
        me.opts.phoneInputs[currIndex][index] = me.initInput(currIndex, index);
    },

    addSection: function () {
        var me = this;
        var index = me.getNewSectionIndex();
        var obj = {};
        var data = {
            section: [
                {
                    sectionIndex: index,
                    close: true,
                    content: [
                        {
                            contentIndex: 0
                        }
                    ]
                }
            ],
            lang: me.page.lang
        };
        me.page.render(me.opts.wrapper, data, {
            type: 'append'
        });
        obj[0] = me.initInput(index, 0);
        me.opts.phoneInputs[index] = obj;
    },

    closeSection: function (dom) {
        var me = this;
        var phoneInputs = me.opts.phoneInputs;
        var $section = $(dom).parents(me.opts.section);
        var index = $section.data('index');
        $section.remove();
        delete phoneInputs[index];
    },

    bindEvents: function () {
        var me = this;
        me.$wrapper
            .on('click', me.opts.addInput, function () {
                me.addInput(this);
            })
            .on('click', me.opts.closeSection, function () {
                me.closeSection(this);
            });

        me.$addSection.on('click', function () {
            me.addSection();
        });
    }
});

module.exports = Section;
