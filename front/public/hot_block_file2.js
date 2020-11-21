/**
 * 热区事件定义
 * 必须放到文件头部
 * */
var __BLOCK_ACTIONS = {
    toHref2: '跳转网页2',
    share2: '分享到朋友圈2',
    shareToUser2: '分享给朋友2',
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
