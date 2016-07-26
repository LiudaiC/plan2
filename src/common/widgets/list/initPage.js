/**
 *
 * @file list.js
 * @author hefeng
 *
 * 列表页公用js
 */

var config = require('../../config');
var DataLoader = require('common/ui/dataLoader/dataLoader');

function Init() {
    var me = this;

    me.opts = {
        isApple: false,

        // 外容器，scroll 的外容器
        wrapper: null,

        // 实际内容容器
        // 这个 $main 将用于 dataLoader 的wrapper
        main: null,

        promise: null,
        offset: 0,
        lang: {},

        // 用于和 rid 一起进行的查询
        status: null,

        // dataLoader 需要使用
        dataKey: 'objList',

        tpl: null
}