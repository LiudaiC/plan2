/**
 * @file myPlanList.js
 * @author hefeng
 * 我的计划列表页
 *
 */

require('./list.scss');
require('common/widgets/list/list.scss');

var config = require('../config');
var navigation = require('common/middleware/navigation');
var InitPage = require('common/widgets/list/initPage');
var Page = require('common/page');
var page = new Page();

var listTpl = require('common/widgets/list/list.tpl');

page.enter = function () {
    var me = this;
    me.list = new InitPage({
        wrap: '#planList',
        main: '#listUl'
    });
    me.render('#listUl', me.data, {
        tmpl: listTpl
    });
};

page.deviceready = function () {

};

page.bindEvents = function () {

};

/**
 * 请求页面接口
 *
 * @param {deferred} dfd, deferred
 *
 */
page.addParallelTask(function (dfd) {
    var me = this;

    var promise = me.get(config.API.MY_PLAN_LIST);

    promise
        .done(function (result) {
            if (result.meta && result.meta.code !== 200) {
                dfd.reject(result);
            }
            else {
                me.data = result.data;
                dfd.resolve(result);
            }
        })
        .fail(function (err) {
            // console.log(err);
        });

    return dfd;
});

page.start();