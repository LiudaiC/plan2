/* eslint-disable */
require('dep/touch');
var tmplItem = require('./item.tpl');
var Pharos = require('common/ui/pharos');
var users = require('common/middleware/users/users');
var util = require('common/util');
var raw = require('common/widgets/raw');
var AttachWrapper = require('common/middleware/attach/attachWrapper');
var DataLoader = require('common/ui/dataLoader/dataLoader');
var MidUI = require('common/middleware/ui');

function dealData(data, page) {

    // page.isDone 不能直接使用，该值为进入页面赋值，并未更改
    data.isDone = function () {
        return page.data.status === 6;
    };

    data.isDoing = function () {
        return page.data.status === 4;
    };

    // 时间展示
    data.dataRaw = function () {
        return raw.formatDateToNow(this.opTime);
    };

    // 只有［任务］在进行中，才可以对事件 & 讨论进行操作
    var taskStatus = util.params('taskStatus');

    // 判断任务是否在进行中
    data.taskDoing = function () {
        if (!taskStatus) {
            return true;
        }

        return parseInt(taskStatus, 10) === 4;
    };

    // 判断是否是评论所有者
    data.deleteRights = function () {
        var uid = users.uid();
        if (this.userId && uid && data.taskDoing()) {
            return this.userId.toString() === uid.toString();
        }

        return false;
    };

    data.lang = page.lang;
}

function getJids(arr, key) {
    var jids = [];
    for (var i = 0; i < arr.length; i ++) {
        var item = arr[i][key];

        if (item && $.inArray(item, jids) === -1) {
            jids.push(item);
        }
    }

    return jids;
}

var renderUser = function ($layout, objList) {
    var me = this;

    if (objList.length <= 0) {
        return;
    }

    var jids = getJids(objList, 'userId');

    var dfdPub = users.getUserAndPhoto(jids);

    dfdPub
        .done(function (pubData) {

            if (pubData) {
                new Pharos($layout, {list: pubData});
            }
            else {
                // me.failUser();
            }
        })
        .fail(function () {
            // me.failUser();
        });


    objList.forEach(function (item) {
        var $item = $('#item-' + item.id);

        if (item.attachs && item.attachs.length > 0) {
            AttachWrapper.initDetailAttach({
                attachData: item.attachs,
                container: '.comments-attach-' + item.id
            });
        }
    });
};

/**
 * 评论发送 log 记录
 *
 * @param {Object} page, new Page()
 * @param {string} name, 页面名称
 * @param {number} id, id
 * @param {boolean} attachNotNull, 附件是否为空
 * @param {number|null} error, 错误码，可为空
 */
function sendCommentLog(page, name, id, attachNotNull, error) {
    if (!page || !name || !id) {
        return;
    }

    var targetTag = {};
    if (name === 'affair') {
        targetTag.affairId = id;
    }
    else {
        targetTag.talkId = id;
    }

    if (attachNotNull) {
        targetTag.attach = attachNotNull;
    }
    var data = {
        actionTag: name + 'CommentSend',
        targetTag: targetTag
    };

    if (error && data.targetTag) {
        data.targetTag.error = error;
    }

    page.log.store(data);
    page.log.send();
};

// 总数
var total = 0;

/**
 * 初始化 评论数据
 *
 * @param {Page} page, new Page
 * @param {Object} options, 配置
 */
var list = function (page, options) {
    var me = this;
    var lang = page.lang;
    me.opts = {
        dataKey: 'objList',
        wrapper: '#comments-main',
        API: {},
        data: null,
        name: ''
    };

    $.extend(me.opts, options);

    me.page = page;
    me.data = me.opts.data;
    me.$main = $(me.opts.wrapper);
    me.$total = $('.comment-total');
    // 避免 page.refresh 继续创建进来
    me.$main.find('dd').not('.list-null').remove();

    me.$listNull = $('.list-null');


    // 防重复提交 @hefeng
    me.isCanSubmit = true;

    // 初始化一个点击加载组件
    me.dataLoader = new DataLoader({
        loadType: 0,
        tpl: tmplItem,
        wrapper: me.$main,
        moreNullHidden: me.opts.moreNullHidden || false,
        promise: me.opts.promise,
        // 后端数据节点位置
        dataKey: me.opts.dataKey,
        pageNum: 10,
        lang: {
            more: {
                default: lang.touchLoadMore,
                process: lang.loading,
                done: lang.dataDone,
                fail: lang.loadFailTryAgain,
                max: lang.contentLoadAllReadey,
                nodata: lang.nowNowData
            },
            reload: {
                default: lang.dropDownRefresh,
                process: lang.loading,
                done: lang.dataDone,
                fail: lang.loadFailTryAgain,
                holder: lang.releaseRefresh,
                unchanged: lang.alreadyLastestData
            }
        }
    });

    me.dataLoader.on('more', function (event, err, data) {

        if (err) {
            return;
        }

        // 评论需要知道是否是已经完成的 讨论 或者 事件
        data.isDone = me.page.data.isDone();

        dealData(data, me.page);

        me.refreshTotal(data.total);

        this.render(data, 'append');
        renderUser(me.$main, data.objList);

        if (!me.isComments()) {
            me.$listNull.removeClass('hide');
        }

    });
    this.bindEvents();
};

$.extend(list.prototype, {

    refreshTotal: function (num) {
        total = num;

        if (!total || total < 0) {
            total = 0;
        }

        this.$total.html('(' + total + ')');
    },

    isComments: function () {
        return this.$main.find('dd').not('.list-null').length;
    },

    scrollCommentsTop: function () {
        var $main = $('.comments-outter');
        var top = $main[0].offsetTop;
        $('.main').scrollTop(top);
    },

    /**
     * 修改 @hefeng, 为了评论的提交按钮在不能提交的时候置灰，在能提交的时候恢复，
     * 在附件上传过程中不能提交，附件和评论存在其一才能提交
     *
     * @param {Object} attach, 附件对象
     */
    attachCallback: function (attach) {
        var me = this;

        if (!attach) {
            return;
        }
        var $send = $('.send');
        var hasAttach = !!attach.getModifyAttaches().length;
        var words = $send.data('notNull');
        var type = 'addClass';

        // 是否有附件，设置状态，配合文字输入时的状态改变
        if (hasAttach) {
            $send.data({attach: true});
        }
        else {
            $send.data({attach: false});
        }

        // 附件是否上传完毕，设置状态，配合文字输入时的状态改变
        if (attach.isAttachesReady()) {
            type = 'removeClass';
            $send.data({isAttachesReady: true});
        }
        else {
            $send.data({isAttachesReady: false});
        }

        // 没有附件和评论则不能提交
        if (!hasAttach && !words) {
            type = 'addClass';
        }

        // 评论输入设置的数据，评论是否超过限制
        if ($send.data('toLong')) {
            type = 'addClass';
        }
        $send[type]('unable');
    },

    bindEvents: function () {
        var me = this;
        var $main = $('#comments-main');
        var $send = $('.send');

        $main.off('click');
        $main.on('click', '.delete', function () {
            var target = $(this).parent();

            MidUI.alert({
                content: me.page.lang.alertRemoveComment,
                onApply: function () {
                    me.removeData(target);
                }
            });
        });

        $send.off('tap');
        $send.on('tap', function (e) {
            if (!$send.hasClass('unable') && me.attach.isAttachesReady() && me.isCanSubmit) {
                me.isCanSubmit = false;
                me.addComment();
            }
        });

        me.attach = AttachWrapper.initAttach({
            container: '#attachList',
            addBtn: '#addAttach',
            callback: function () {
                me.attachCallback(me.attach);
            }
        });
        $send.data({isAttachesReady: true});
    },

    /**
     * 删除评论
     *
     * @param {string} id, user id
     */
    removeData: function (target) {
        var me = this;
        var $target = $(target);
        var id = $target.data('id');
        // var uid = $target.data('uid');

        var promise = this.page.post(this.opts.API.delete, {
            commentId: id
        });

        promise
            .done(function (result) {

                if (!result) {
                    return;
                }

                if (result.meta.code === 200) {
                    $('#item-' + id).addClass('hide').remove();
                    me.refreshTotal(total - 1);
                }
                else {

                }
            })
            .fail(function (err) {
                
            })
            // 判断是否一条数据都没有了
            .always(function () {
                var len = me.$main.find('dd').not('.list-null').length;

                if (len <= 0) {
                    me.$listNull.removeClass('hide');
                }
                else {
                    me.$listNull.addClass('hide');
                }
            });
    },

    /**
     * 添加评论
     */
    addComment: function () {
        var me = this;
        var $content = $('.editable');
        var text = $content.val();
        var $null = $('.list-null');
        var $send = $('.send');
        var attachs = me.attach.getModifyAttaches();

        var promise = me.page.post(me.opts.API.add, {
            // 0 代表新增评论
            id: 0,
            moduleId: me.data.id,
            content: text,
            message: {
                'sentEim': true,
                'sentEmai': false,
                'sentSms': false
            },
            // 附件暂时为空
            attachements: attachs
        });

        promise
            .done(function (result) {

                if (!result || result.meta.code !== 200) {
                    return;
                }
                // 添加成功
                if (result.meta.code === 200) {
                    // 共用 ./item.tpl
                    var data = {
                        objList: [result.data]
                    };
                    
                    dealData(data, me.page);

                    me.page.render($('.comments dd').eq(0), data, {
                        tmpl: tmplItem,
                        type: 'before'
                    });

                    me.refreshTotal(total + 1);

                    getUserAndPhoto([result.data]);

                    // 待优化
                    // 这里可以判断是否已经有了当前用户的信息
                    renderUser(me.$main, data.objList);
                    $send.data({attach: false});
                    $send.data({isAttachesReady: true});
                    me.page.virtualInput.reset();
                    $('#attachList ul').remove();
                    me.$listNull.addClass('hide');
                    var p = $('#addAttach').parent();
                    $('#addAttach').off().remove();
                    p.prepend('<span class="button" id="addAttach"></span>');
                    me.attach = AttachWrapper.initAttach({
                        container: '#attachList',
                        addBtn: '#addAttach',
                        callback: function () {
                            me.attachCallback(me.attach);
                        }
                    });

                    // 滚动到comments顶部
                    me.scrollCommentsTop();
                }
                else {

                }
            })
            .fail(function (err) {
                
            })
            .always(function (result) {
                me.isCanSubmit = true;
                var errCode = (result && result.meta && result.meta.code !== 200) ? result.meta.code : '';
                var attachNotNull = !!attachs.length;
                sendCommentLog(me.page, me.opts.name, me.data.id, attachNotNull, errCode);
            });
    }
});

/**
 * 获取人员信息
 *
 * @param {Array} arr, 后端数据 评论数组
 */
function getUserAndPhoto(arr) {
    if (!arr || arr.length <= 0) {
        return;
    }

    var jids = [];

    arr.forEach(function (item) {
        jids.push(item.userId);
    });

    users.getUserAndPhoto(jids)
        .done(function (data) {
            if (data && data.length > 0) {
                render(data);
            }
        })
        .fail(function () {});
}

/**
 * 后渲染 人员信息
 *
 * @param {Array} arr, 后端数据 评论数组
 */
function render(data) {

    data.forEach(function (item) {

        var $item = $('.user-' + users.takeJid(item.jid));

        if ($item.length) {
            $item.find('.user-photo').html('<img src="data:image/png;base64,' + item.base64 + '" />');
            $item.find('.user-name').html(item.name);
        }
    });
}

module.exports = list;
