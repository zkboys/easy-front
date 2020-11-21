/**
 * 热区事件定义
 * 必须放到文件头部
 * */
var __BLOCK_ACTIONS = {
    toHref: '跳转网页',
    share: '分享到朋友圈',
    shareToUser: '分享给朋友',
};

var actionHandler = {
    toHref: function(params) {
        window.location.href = params;
    },
};

/**
 * 处理点击事件
 *
 * 需要定义为全局函数，热区点击时，会调用此函数
 * @param action
 * @param params
 */
function __HANDLE_BLOCK_CLICK(action, params) {
    console.log(action, params);
    const handler = actionHandler[action];
    if (handler) {
        handler(params);
    }
}
