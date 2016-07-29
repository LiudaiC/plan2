/**
 * 
 * @file new.js
 * @author hefeng
 *
 * 新建计划页
 */

require('./new.scss');
var config = require('../config');
var Title = require('./input/title');
var Section = require('./input/section');
var Page = require('common/page');
var page = new Page();

page.enter = function () {
    var me = this;
    me.render('#plan-options', me.data);
    loadTitle();

    me.section = new Section({
        wrapper: '#plan-content',
        page: me
    });
};

page.deviceready = function () {

};

page.bindEvents = function () {

};

function loadTitle() {
    var $wrap = $('.plan-title');
    var $input = $wrap.find('.input');
    page.phoneTitle = new Title({
        wrap: $wrap,
        input: $input
    });
}

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;

    var promise = me.get(config.API.PLAN_NEW);

    promise
        .done(function (result) {
            if (result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                me.data = result.data;
                dfd.resolve();
            }
        });
    return dfd;
});
page.start();
