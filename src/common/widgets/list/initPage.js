/**
 *
 * @file list.js
 * @author hefeng
 *
 * 列表页公用js
 */

var config = require('../../../config');
var DataLoader = require('common/ui/dataLoader/dataLoader');
var util = require('common/util');

function Init(options) {

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

        tpl: null,

        onLoadError: function () {}
    };

    $.extend(me.opts, options);

    me.$wrapper = $(me.opts.wrapper);
    me.$main = me.$wrapper.find(me.opts.main);

    me.$loader = me.$wrapper.find('.data-more');
    me._loaderHeight = me.$loader.height();

    me._deviceTimer = null;
    me._deviceTimeout = null;

    me.init();
}

$.extend(Init.prototype, {
    init: function () {
        var me = this;
        var lang = me.opts.lang;

        // 这里的分页请求由 dataLoader 来处理
        me.dataLoader = new DataLoader({
            promise: me.opts.promise,
            dataKey: 'objList',
            wrapper: me.$main,
            scrollWrapper: me.$wrapper,
            lang: {
                more: {
                    'default': lang.pullUpLoadMore,
                    'process': lang.loading,
                    'done': lang.dataDone,
                    'fail': lang.loadFailTryAgain,
                    'max': lang.contentLoadAllReadey,
                    'nodata': lang.nowNowData
                },
                reload: {
                    'default': lang.dropDownRefresh,
                    'process': lang.loading,
                    'done': lang.dataDone,
                    'fail': lang.loadFailTryAgain,
                    'holder': lang.releaseRefresh,
                    'unchanged': lang.alreadyLastestData
                }
            },
            moreNullHidden: true,
            tpl: me.opts.tpl,
            reloadHandler: me.$wrapper.find('.data-reload'),
            moreHandler: me.$wrapper.find('.data-more')
        });

        me.dataLoader.on('scrollMore', function (event, loader) {
            me.getMoreData();
        });

        me.dataLoader.on('scrollReload', function (event, loader, refresh) {
            me.getReloadData(loader, refresh);
        });

        me.getFirst();
    },

    /**
     * 初始化第一个
     */
    getFirst: function () {
        var me = this;

        me.getMoreData(function (data) {

            // 加载错误的情况下，渲染错误页面，并且创建一个错误信息
            if (!data) {
                var errData = {
                    lang: {
                        netErr: '加载失败',
                        tapPageReLoad: '点击重试'
                    }
                };

                me.dataLoader.hideMore();
                me.dataLoader.error(errData);
                me.opts.onLoadError();
            }

            if (data.objList && data.objList.length <= 0) {
                me.opts.onDataNull && me.opts.onDataNull(me.dataLoader);
            }
        });
    },

    /**
     * 基础设置
     */
    setBasic: function () {

        var me = this;

        // 设置下高度
        var viewHeight = $(window).height() - $('#filter').height();

        // 设置滚动的元素的高宽
        $('.slider-container').css({
            width: $(window).width(),
            height: viewHeight
        });

        var $err = me.opts.wrapper.find('.net-err');
        if ($err.length > 0) {
            $err.addClass('hide').remove();
        }

        var height = $(window).height() - $('#filter').height();

        // 解决下拉过多后再次加载少量数据导致iScroll高度设置不对
        me.$main.addClass('initial');

        // 这里要先获取高度
        var objHeight = me.$main.height() + me.opts.offset;

        me.$main.removeClass('initial');

        if (me.$loader.hasClass('hide')) {
            // 如果加载条被隐藏，这里要减去加载条的高度，同时 + 需要漏出的边距
            objHeight = objHeight - me._loaderHeight + 15;
        }

        // 保证页面的最小高度
        if (objHeight < height) {
            objHeight = height;
        }

        // 很重要，这个实际用于滚动的容器需要设置可视高度
        me.$wrapper.find('.scroll-inner').css({
            height: objHeight
        });

        // @hefeng
        // 为了保证任何状态都可以下拉刷新，比如列表没有满一屏时。
        me.$wrapper.height(height - 1);
    },

    /**
     * 重新加载数据
     *
     * @param {Function} loader, dataLoader
     * @param {boolean} refresh, 是否直接刷新，不通过 unchanged 的判断
     */
    getReloadData: function (loader, refresh) {
        var me = this;

        me.dataLoader.requestReload(refresh)
            .done(function (data, unchanged) {

                // 最新数据没有变化，不进行后面的 dom 操作
                // 如果不需要强制刷新，同时数据没有变化
                // 重载页面之后 task/list.js 会直接调用 dataLoader.fire('scrollReload', null, true);
                if (!refresh && unchanged) {
                    return;
                }

                // 用于分页提示
                data.pagenum = this.page;

                me.renderMain(this, data);

                me.setBasic();

                me.dataLoader.scroll.refresh();

                // 返回刷新
                if (refresh) {

                    // @hefeng
                    // 在任务详情中操作了任务，导致在原tab选项中没有了该任务，
                    // 当只有一个任务在该tab选项时，返回后列表为空，因此需要渲染空页面
                    if (data.objList && data.objList.length <= 0) {
                        me.opts.onDataNull && me.opts.onDataNull(me.dataLoader);
                    }

                    setTimeout(function () {
                        me.dataLoader.scroll.scrollTo(0, 0, 100);
                    }, 100);
                }
            })
            .fail(function () {})
            .always(function () {});
    },

    /**
     * 获取更多数据
     *
     * @param {Function} callback, 回调
     */
    getMoreData: function (callback) {
        var me = this;

        var $err = me.opts.wrapper.find('.net-err');
        if ($err.length > 0) {
            $err.addClass('hide').remove();
        }

        me.dataLoader.requestMore(function (err, data) {

            if (err || !data) {

                /**
                 * 离线机制
                 */
                if (!util.isNetwork()) {
                    var offlineData = coll.find({
                        rid: rid,
                        status: me.opts.status
                    });

                    me.renderMain(me.dataLoader, offlineData);

                    me.setBasic();

                    me.offline();
                    // 初始化滚动
                    // me.initScroll();

                    // 初始化了数据之后，直接禁用 loader
                    me.dataLoader.disable();

                    return;
                }

                callback && callback(null);
                return;
            }

            me.renderMain(this, data, 'append');

            me.setBasic();

            callback && callback(data);
        });
    },

    /**
     * 渲染主体部分
     *
     * @param {Function} loader, dataLoader
     * @param {Object} data, 数据
     * @param {string} appendType, append 方式
     */
    renderMain: function (loader, data, appendType) {
        if (!data) {
            return;
        }

        var me = this;

        if (data.total < 3) {
            me.$wrapper.find('.list-wrapper-content').css({
                'min-height': 'initial'
            });
        }

        loader.render(data, appendType || 'html');
    },

    /**
     * 页面离线事务
     */
    offline: function () {
        // $('#main').off('click');
        // $('.page-loader li').off('click');
        $('.search-in').off('click');
    }
});


module.exports = Init;
