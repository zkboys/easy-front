// import { ajax } from 'src/commons/ajax';
/*
* 菜单数据 返回Promise各式，支持前端硬编码、异步获取菜单数据
* */
export default function getMenus(userId) {
    // return ajax.get('/sessionUserMenus', { userId }).then(res => {
    //     return (res || []).map(item => ({ key: item.id, parentKey: item.parentId, ...item }));
    // });

    // TODO 根据userId获取菜单数据 或在此文件中前端硬编码菜单
    return Promise.resolve(
        [
            // { key: 'user', text: '用户管理', icon: 'user', path: '/users', order: 900 },
            // { key: 'role', text: '角色管理', icon: 'lock', path: '/roles', order: 900 },
            // { key: 'menu', text: '菜单管理', icon: 'align-left', path: '/menu', order: 900 },
        ],
    );
}
