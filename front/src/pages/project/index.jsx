import React from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';

import './style.less';

export default config({
    pageHead: false,
    path: '/projects/:projectId/:tabId',
    connect: true,
})(props => {

    return (
        <PageContent>
            项目页面

            动态：

            创建团队
            修改团队 - 详情
            添加成员
            删除成员
            离开团队
            修改成员角色


            // 项目的动态 团队也可以获取
            创建项目
            修改项目
            删除项目
            离开项目



        </PageContent>
    );
});
