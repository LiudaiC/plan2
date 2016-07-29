/**
 * @file index.js
 * @author hefeng
 * 首页
 *
 */

require('./index.scss');
// var config = require('../config');
var navigation = require('common/middleware/navigation');
var Page = require('common/page');
var page = new Page();
require('common/ui/touchButton')();

page.enter = function () {
    var me = this;
    me.render('#bottom-wrapper', {
        lang: this.lang
    });
};

page.deviceready = function () {
    var lang = this.lang;
    navigation.title(lang.plan);
};

page.bindEvents = function () {

};

page.start();
