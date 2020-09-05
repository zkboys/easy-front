import { session } from 'src/library/utils/storage';
import { getNodeByPropertyAndValue, convertToTree } from 'src/library/utils/tree-utils';
import { pathToRegexp } from 'path-to-regexp';
import { loadScript } from '@/library/utils';
import { ROUTE_BASE_NAME } from 'src/router/AppRouter';

const LOGIN_USER_STORAGE_KEY = 'login-user';

const localStorage = window.localStorage;
const sessionStorage = window.sessionStorage;

/**
 * 判断是否有权限
 * @param code
 */
export function hasPermission(code) {
    const loginUser = getLoginUser();
    return loginUser?.permissions?.includes(code);
}

/**
 * 设置当前用户信息
 * @param loginUser 当前登录用户信息
 */
export function setLoginUser(loginUser = {}) {
    // 将用户属性在这里展开，方便查看系统都用到了那些用户属性
    const { id, name, avatar, token, permissions, ...others } = loginUser;
    const userStr = JSON.stringify({
        id,             // 用户id 必须
        name,           // 用户名 必须
        avatar,         // 用头像 非必须
        token,          // 登录凭证 非必须 ajax请求有可能会用到，也许是cookie
        permissions,    // 用户权限
        ...others,      // 其他属性
    });

    sessionStorage.setItem(LOGIN_USER_STORAGE_KEY, userStr);
}

/**
 * 获取当前用户信息
 * @returns {any}
 */
export function getLoginUser() {
    const loginUser = sessionStorage.getItem(LOGIN_USER_STORAGE_KEY);

    return loginUser ? JSON.parse(loginUser) : null;
}

/**
 * 判断用户是否登录 前端简单通过登录用户是否存在来判断
 * @returns {boolean}
 */
export function isLogin() {
    // 如果当前用户存在，就认为已经登录了
    return !!getLoginUser();
}

/**
 * 进入首页
 */
export function toHome() {
    // 跳转页面，优先跳转上次登出页面
    const lastHref = window.sessionStorage.getItem('last-href');

    // 强制跳转 进入系统之后，需要一些初始化工作，需要所有的js重新加载
    // 拼接ROUTE_BASE_NAME，系统有可能发布在域名二级目录下
    window.location.href = lastHref || `${ROUTE_BASE_NAME}/`;
}

/**
 * 跳转到登录页面
 */
export function toLogin() {
    const loginPath = '/login';

    // 判断当前页面是否已经是login页面，如果是，直接返回，不进行跳转，防止出现跳转死循环
    const pathname = window.location.pathname;
    const isLogin = pathname.indexOf(loginPath) !== -1;

    if (isLogin) return null;

    // 清除相关数据
    session.clear();
    localStorage.setItem(LOGIN_USER_STORAGE_KEY, null);
    sessionStorage.clear();
    sessionStorage.setItem('last-href', window.location.pathname);

    // 强制跳转，让浏览器刷新，重置数据
    window.location.href = `${ROUTE_BASE_NAME}${loginPath}`;

    return null;
}

/**
 * 根据path获取对应的菜单
 * @param path
 * @param menuTreeData
 * @returns {*}
 */
export function getSelectedMenuByPath(path, menuTreeData) {
    path = path.replace(ROUTE_BASE_NAME, '');
    let selectedMenu;
    if (menuTreeData) {
        if (path.indexOf('/_') > -1) {
            path = path.substring(0, path.indexOf('/_'));
        }

        // 先精确匹配
        selectedMenu = getNodeByPropertyAndValue(menuTreeData, 'path', path, (itemValue, value, item) => {
            const isTop = item.children && item.children.length;
            return itemValue === value && !isTop; // 排除父级节点
        });

        // 正则匹配，路由中有`:id`的情况
        // fixme 容易出问题：a/b/:id,会匹配 a/b/1, a/b/detail，有可能不是期望的结果，注意路由写法，a/b/tab/:id 具体的:id，添加一级，用来表明id是什么
        if (!selectedMenu && path !== '/') {
            selectedMenu = getNodeByPropertyAndValue(menuTreeData, 'path', path, (itemValue, value, item) => {
                const isTop = item.children && item.children.length;
                const re = pathToRegexp(itemValue);
                return !!re.exec(value) && !isTop; // 排除父级节点
            });
        }
    }
    return selectedMenu;
}


/**
 * 获取菜单树状结构数据 和 随菜单携带过来的权限
 * @param menus 扁平化菜单数据
 */
export function getMenuTreeDataAndPermissions(menus) {
    // 用户权限code，通过菜单携带过来的 1 => 菜单 2 => 功能
    const permissions = menus.map(item => {
        if (item.type === '1') return item.key;
        if (item.type === '2') return item.code;
        return null;
    });

    // 获取菜单，过滤掉功能码
    menus = menus.filter(item => item.type !== '2');

    // 处理path： 只声明了url，为iframe页面
    menus = menus.map(item => {
        if (item.url) {
            item.path = `/iframe_page_/${window.encodeURIComponent(item.url)}`;
        }
        return item;
    });

    // 菜单根据order 排序
    const orderedData = [ ...menus ].sort((a, b) => {
        const aOrder = a.order || 0;
        const bOrder = b.order || 0;

        // 如果order都不存在，根据 text 排序
        if (!aOrder && !bOrder) {
            return a.text > b.text ? 1 : -1;
        }

        return bOrder - aOrder;
    });

    // 设置顶级节点path，有的顶级没有指定path，默认设置为子孙节点的第一个path
    const findPath = (node) => {
        const children = orderedData.filter(item => item.parentKey === node.key);
        let path = '';
        if (children && children.length) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.path) {
                    path = child.path;
                    break;
                }
                path = findPath(child);
            }
        }
        return path;
    };

    orderedData.forEach(item => {
        if (!item.path) {
            item.path = findPath(item);
        }
    });

    const menuTreeData = convertToTree(orderedData);
    return { menuTreeData, permissions };
}


const colors = [
    '#2f54eb',
    'rgb(246,179,7)',
    'rgb(80, 193, 233)',
    'rgb(169, 109, 243)',
    'rgb(245,97,58)',
    'rgb(103, 197, 12)',
    'rgb(80, 193, 233)',
    'rgb(110,58,120)',
];

// 根据字符获取颜色
export function getColor(str) {
    if (!str) return colors[0];
    return colors[str.charCodeAt(0) % colors.length];
}

export const roleOptions = [
    { value: 'master', label: '管理员', color: '#f50' },
    { value: 'member', label: '成员', color: '#2db7f5' },
];

export const httpMethodOptions = [
    { value: 'get', label: 'GET', color: 'green' },
    { value: 'post', label: 'POST', color: 'geekblue' },
    { value: 'put', label: 'PUT', color: 'purple' },
    { value: 'delete', label: 'DELETE', color: 'red' },
    { value: 'head', label: 'HEAD', color: 'volcano' },
    { value: 'options', label: 'OPTIONS', color: 'orange' },
    { value: 'patch', label: 'PATCH', color: 'gold' },
];

export const apiStatusOptions = [
    { value: '00', label: '未完成', color: 'red' },
    { value: '01', label: '已完成', color: 'green' },
];

export const valueTypeOptions = [
    { value: 'string', label: 'String', color: '' },
    { value: 'number', label: 'Number', color: '' },
    { value: 'boolean', label: 'Boolean', color: '' },
    { value: 'object', label: 'Object', color: '' },
    { value: 'array', label: 'Array', color: '' },
];


const OLD_LESS_ID = `less:color:old`;
const LESS_ID = `less:color`;
const LESS_URL = `/less.min.js`;

// 主题颜色快速生效
const themeStyleContent = window.localStorage.getItem('theme-style-content');
if (themeStyleContent) {
    const themeStyle = document.createElement('style');
    themeStyle.type = 'text/css';
    themeStyle.id = OLD_LESS_ID;
    themeStyle.innerHTML = themeStyleContent;
    document.body.insertBefore(themeStyle, document.body.firstChild);
}

export function setPrimaryColor(color) {
    const changeColor = () => {
        window.less
            .modifyVars({
                '@primary-color': color,
            })
            .then(() => {
                // 先清除缓存样式
                const oldStyle = document.getElementById(OLD_LESS_ID);
                if (oldStyle) oldStyle.remove();

                // 将生成之后的style标签插入body首部
                // 由于每个页面的css也是异步加载（无论开发、还是生产），会导致样式插入在生成的style标签之后，导致主题失效
                const lessColor = document.getElementById(LESS_ID);
                if (!lessColor) return;

                // document.head.appendChild(lessColor);
                document.body.insertBefore(lessColor, document.body.firstChild);
                window.localStorage.setItem('theme-style-content', lessColor.innerHTML);
            });
    };

    if (window._lessLoaded) {
        changeColor();
    } else {
        window.less = {
            logLevel: 2,
            async: true,
            javascriptEnabled: true,
            modifyVars: { // less.js加载完成就会触发一次转换，需要传入变量
                '@primary-color': color,
            },
        };

        loadScript(LESS_URL).then(() => {
            window._lessLoaded = true;
            changeColor();
        });
    }
}

// 获取path中参数
export function getPathParams(path) {
    if (!path) return [];

    const pathArr = path.split('/');
    const pathKeysArr = pathArr.filter(item => item.startsWith(':') || item.startsWith('{'));

    return pathKeysArr.map(item => {
        const key = item.replace(':', '').replace('{', '').replace('}', '');
        const type = 'path';
        return { key, type };
    });
};
