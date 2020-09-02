import React, { useEffect, useState, useMemo } from 'react';
import config from 'src/commons/config-hoc';
import { Tabs, Menu, Tooltip, Empty, Button, Input, Modal, Popconfirm } from 'antd';
import {
    ProjectOutlined,
    UsergroupAddOutlined,
    FolderOpenOutlined,
    FormOutlined,
    AppstoreOutlined,
    SolutionOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import { useGet, useDel } from 'src/commons/ajax';
import RoleTag from 'src/components/role-tag';
import TabPage from 'src/components/tab-page';
import Dynamic from 'src/components/dynamic';
import CategoryModal from './CategoryModal';

import './style.less';
import { getColor } from '@/commons';

const { TabPane } = Tabs;

export default config({
    pageHead: false,
    path: '/projects/:projectId/:tabId',
    connect: true,
    query: true,
})(props => {
    const { user, match: { params }, query } = props;
    const { projectId } = params;
    const [ apiId, setApiId ] = useState(query.apiId);
    const [ categoryId, setCategoryId ] = useState(query.setCategoryId);
    const [ activeKey, setActiveKey ] = useState(params.tabId !== ':tabId' ? params.tabId : 'project');
    const [ project, setProject ] = useState({});
    const [ categoryVisible, setCategoryVisible ] = useState(false);
    const [ editCategoryId, setEditCategoryId ] = useState(null);

    const [ projectLoading, fetchProject ] = useGet('/projects/:id');
    const [ projectDeleteLoading, deleteProject ] = useDel('/projects/:id');


    // 只用projectId, project 更新之后，Dynamic才重新渲染
    const dynamicComponent = useMemo(() => (
        <div className="pan-content">
            <Dynamic url={`/projects/${projectId}/dynamics`} project={project}/>
        </div>
    ), [ project ]);

    // 删除项目
    async function handleDeleteProject() {
        if (projectDeleteLoading) return;
        await deleteProject(projectId, { successTip: '删除成功！' });
        props.history.goBack();
    }

    // 组件加载完成
    useEffect(() => {
        (async () => {

        })();
    }, []);

    // 改变浏览器地址
    useEffect(() => {
        props.history.replace(`/projects/${projectId}/${activeKey}`);
    }, [ activeKey ]);

    // projectId改变 获取 project详情
    useEffect(() => {
        (async () => {
            if (!projectId || projectId === ':projectId') return;

            try {
                const project = await fetchProject(projectId);
                if (!project) {
                    return Modal.confirm({
                        title: '提示',
                        content: '此项目已被删除！',
                        okText: '去首页',
                        onOk: () => props.history.replace('/'),
                        cancelText: '返回',
                        onCancel: () => props.history.goBack(),
                    });
                }

                setProject(project);
            } catch (e) {
                if (e?.response?.status === 403) {
                    Modal.confirm({
                        title: '提示',
                        content: '您暂未加入此项目，请联系项目管理员将您加入！',
                        okText: '去首页',
                        onOk: () => props.history.replace('/'),
                        cancelText: '返回',
                        onCancel: () => props.history.goBack(),
                    });
                }
            }
        })();
    }, [ projectId ]);

    const color = getColor(project.name);

    const userProjectRole = project?.users?.find(item => item.id === user.id)?.project_user.role;
    const isProjectMaster = user.isAdmin || [ 'owner', 'master' ].includes(userProjectRole);
    const isProjectOwner = user.isAdmin || [ 'owner' ].includes(userProjectRole);

    console.log(project);
    return (
        <>
            <TabPage
                loading={
                    projectLoading ||
                    projectDeleteLoading
                }
                detailStyle={{ backgroundColor: color }}
                activeKey={activeKey}
                onChange={key => setActiveKey(key)}
                detail={(
                    <>
                        <div styleName="title">
                            <RoleTag role={userProjectRole}/>
                            <h1>{project.name}</h1>

                            {isProjectMaster ? (
                                <Button ghost onClick={() => setCategoryVisible(true) || setEditCategoryId(null)}>
                                    <FolderOpenOutlined/>
                                    添加分类
                                </Button>
                            ) : null}
                        </div>
                        <div styleName="description">
                            {project.description}
                        </div>
                        <Input
                            id="search-api"
                            allowClear
                            placeholder="输入分类、接口名称进行搜索"
                        />
                    </>
                )}
                list={null}
            >
                <TabPane tab={<span><AppstoreOutlined/> 接口</span>} key="api"></TabPane>
                <TabPane tab={<span><ProjectOutlined/> 项目成员</span>} key="member"></TabPane>
                <TabPane tab={<span><ProjectOutlined/> 设置</span>} key="setting"></TabPane>
                <TabPane tab={<span><SolutionOutlined/> 项目动态</span>} key="dynamic">
                    {dynamicComponent}
                </TabPane>
            </TabPage>

            <CategoryModal
                visible={categoryVisible}
                projectId={projectId}
                id={editCategoryId}
                isEdit={!!editCategoryId}
                onOk={() => {
                    setCategoryVisible(false);
                }}
                onCancel={() => setCategoryVisible(false)}
            />
        </>
    );
});
