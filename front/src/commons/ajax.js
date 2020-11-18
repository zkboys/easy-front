import SXAjax, { createHoc, createHooks } from 'src/library/ajax';
import mockUrls from '../mock/url-config';
import handleError from './handle-error';
import handleSuccess from './handle-success';
import { getLoginUser } from 'src/commons';
import cfg from 'src/config';

const { ajaxPrefix, ajaxTimeout } = cfg;

const loginUser = getLoginUser() || {};

// 默认配置在这里设置
export function getDefaultSettings(instance) {
    instance.defaults.baseURL = ajaxPrefix;
    instance.defaults.withCredentials = false; // 跨域携带cookie 如果为true 后端的 Access-Control-Allow-Origin不能设置为*
    instance.defaults.timeout = ajaxTimeout;
    instance.mockDefaults.baseURL = '/';
    // instance.defaults.headers['XXX-TOKEN'] = 'token-value';
    instance.defaults.headers['token'] = loginUser.token || window.sessionStorage.getItem('token');
}

// ajax工具，含有errorTip 和 successTip
const _ajax = new SXAjax({
    onShowErrorTip: (error, errorTip) => handleError({ error, errorTip }),
    onShowSuccessTip: (response, successTip) => handleSuccess({ successTip }),
    isMock,
    reject: true,
});
getDefaultSettings(_ajax);

const {
    useGet: _useGet,
    useDel: _useDel,
    usePost: _usePost,
    usePut: _usePut,
} = createHooks(_ajax);

export const useGet = _useGet;
export const useDel = _useDel;
export const usePost = _usePost;
export const usePut = _usePut;

// ajax高阶组件
export const ajaxHoc = createHoc(_ajax);

// ajax工具，不含有 errorTip和successTip 一般models会使用
export const ajax = new SXAjax({ isMock });
getDefaultSettings(ajax);

// mockjs使用的axios实例
export const mockInstance = ajax.mockInstance = _ajax.mockInstance;

// 请求前拦截
[ ajax.instance, _ajax.instance ].forEach(instance => {
    instance.interceptors.request.use(cfg => {
        // Do something before request is sent
        return cfg;
    }, error => {
        // Do something with request error
        return Promise.reject(error);
    });
});

// 判断请求是否是mock
function isMock(url /* url, data, method, options */) {
    return mockUrls.indexOf(url) > -1 || url.startsWith('/mock1');
}

