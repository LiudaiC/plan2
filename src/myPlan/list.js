/**
 * @file myPlanList.js
 * @author hefeng
 *
 * 我的计划列表页
 */

require('./list.scss');
require('common/widgets/filter/filter.scss');

var config = require('../config');
var navigation = require('common/middleware/navigation');
var InitPage = require('common/widgets/list/initPage');
var Filter = require('common/widgets/filter/filter');
var Page = require('common/page');
var page = new Page();

var listTpl = require('./list/item.tpl');

page.enter = function () {
    var me = this;
    var lang = me.lang;
    loadPage();
    me.filter = new Filter('#filter', {
        menuData: {
            menu: [
                {
                    title: lang.type,
                    name: 'type',
                    item: [
                        {
                            content: lang.all,
                            curr: true
                        },
                        {
                            content: lang.weekPlan
                        },
                        {
                            content: lang.monthPlan
                        },
                        {
                            content: lang.customPlan
                        }
                    ]
                },
                {
                    title: lang.time,
                    name: 'time',
                    item: [
                        {
                            content: lang.all,
                            curr: true
                        },
                        {
                            content: lang.customTime
                        }
                    ]
                }
            ]
        }
    });
};

page.deviceready = function () {

};

page.bindEvents = function () {

};

function loadPage() {
    var $wrapper = $('.slider-container')
    var $loader = $wrapper.find('.data-more');
    var offset = $loader.height();
    page.list = new InitPage({
        isApple: page._shell.apple,
        wrapper: $('.scroll-outer'),
        main: '#listUl',
        lang: page.lang,

        promise: function () {
            return page.get(config.API.MY_PLAN_LIST);
        },
        tpl: listTpl,
        offset: offset
    });
}

page.start();
