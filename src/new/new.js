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
var PhoneInput = require('common/ui/phoneInput/phoneInput');
var Page = require('common/page');
var page = new Page();

page.enter = function () {
    var me = this;
    me.render('#plan-options', me.data);
    loadTitle();

    me.phoneInput = new PhoneInput({
        handler: '.phone-input',
        input: '.phone-input-main',
        limit: 50,
        delete: true
    })
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
