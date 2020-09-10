const proxy = require('http-proxy-middleware');

const prefix = process.env.AJAX_PREFIX || '/api';

module.exports = function(app) {
    app.use(proxy(prefix,
        {
            target: 'http://localhost:3000/',
            pathRewrite: {
                // ['^' + prefix]: '', // 如果后端接口无前缀，可以通过这种方式去掉
            },
            changeOrigin: true,
            secure: false, // 是否验证证书
            ws: true, // 启用websocket
        },
    ));
    app.use(proxy('/mock',
        {
            target: 'http://localhost:3000/',
            changeOrigin: true,
            secure: false, // 是否验证证书
            ws: true, // 启用websocket
        },
    ));
    app.use(proxy('/upload',
        {
            target: 'http://localhost:3000/',
            changeOrigin: true,
            secure: false, // 是否验证证书
            ws: true, // 启用websocket
        },
    ));
    app.use(proxy('/wiki',
        {
            target: 'http://localhost:3000/',
            changeOrigin: true,
            secure: false, // 是否验证证书
            ws: true, // 启用websocket
        },
    ));
    app.use(proxy('/projects/*/imgs',
        {
            target: 'http://localhost:3000/wiki/projects/*/imgs',
            changeOrigin: true,
            secure: false, // 是否验证证书
            ws: true, // 启用websocket
        },
    ));
};
