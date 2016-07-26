/**
 * @file config.js
 * @author deo
 * 前端请求配置
 */
var config = {

    VERSION: '1',

    debug: false,

    API: {
        host: '',
        MY_PLAN_LIST: 'myPlanList'
    }
};

// attach uploadUrl

/**
 * [重要] 目前上传等和以前组件相关的因为没有自动拼装 ajax url, 所以这里要写完整
 */
config.API.ATTACH_UPLOADURL = config.API.host + '/mgw/common/attachment/getFSTokensOnCreate';
// attach resumeUrl
config.API.ATTACH_RESUMEURL = config.API.host + '/mgw/common/attachment/getFSTokensOnContinue';

/**
 * 公用参数
 */
config.const = {

    // localstorage 公用参数
    PARAMS: 'PLAN_PARAMS',

    // local database
    DATABASE_NAME: 'PLAN_DATABASE'
};

// 以下参数 febd.config.js & page.js 使用
// 联调环境的时候，需要先在联调环境登录 [DHC]，并且把 token 保存，才可以在和后端握手的时候确认身份
config.mock = {

    // 这个需要通过
    token: '0966600c-dfcf-4ac9-b9b7-f539821a06f3-301719'
    // mock 代理服务不要最后的 '/'
    // proxyPrefix: '/api',

    // target: 'http://task2.test1.com:8015/data/'
    // target: 'http://web.test1.com/task/m/v1/'
    // proxyPath: config.API.host + config.API.prefix
};

/* eslint-disable */
// debug 模式
// 如果 mock.proxyPrefix 和 API.prefix 指向同一个 路由，则代表需要进行转发
// prefix = '/data/' 为前端本地开发调试使用

config.debug = true;

if (config.debug) {
    var loc = window.location;

    // 直接走 mock server

    // config.API.host = document.location.protocol + '//task2.test1.com:8015';
    config.API.host = loc.protocol + '//' + loc.hostname + ':8015';
    config.API.prefix = '/data/';
}
/* eslint-enable */

module.exports = config;
