import React, { useEffect, useState, useMemo } from 'react';
import config from 'src/commons/config-hoc';
import { Tabs, Button, Input, Modal } from 'antd';
import {
    FolderOpenOutlined,
    SolutionOutlined,
    SettingOutlined,
    ApiOutlined,
    TeamOutlined,
    BookOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import { useGet } from 'src/commons/ajax';
import RoleTag from 'src/components/role-tag';
import TabPage from 'src/components/tab-page';
import Dynamic from 'src/components/dynamic';
import CategoryModal from './CategoryModal';
import CategoryMenu from './CategoryMenu';
import ApiList from './ApiList';
import Api from 'src/pages/api';

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
    const [ height, setHeight ] = useState();
    const [ apiKeyWord, setApiKeyWord ] = useState(undefined);

    const [ activeKey, setActiveKey ] = useState(params.tabId !== ':tabId' ? params.tabId : 'api');
    const [ categoryId, setCategoryId ] = useState(query.setCategoryId);
    const [ apiId, setApiId ] = useState(query.apiId);
    const [ apiTabKey, setApiTabKey ] = useState(query.apiTabKey);

    const [ project, setProject ] = useState({});
    const [ categoryVisible, setCategoryVisible ] = useState(false);
    const [ editCategoryId, setEditCategoryId ] = useState(null);

    const [ projectLoading, fetchProject ] = useGet('/projects/:id');


    // 只用projectId, project 更新之后，Dynamic才重新渲染
    const dynamicComponent = useMemo(() => (
        <div className="pan-content" style={{ height: height + 50 }}>
            <Dynamic url={`/projects/${projectId}/dynamics`} project={project}/>
        </div>
    ), [ height, project ]);

    const apiListComponent = useMemo(() => (
        <ApiList
            height={height}
            project={project}
            categoryId={categoryId}
            onChange={() => setProject({ ...project })}
            onClick={record => setApiId(record.id)}
        />
    ), [ height, project, categoryId ]);

    const apiComponent = useMemo(() => (
        <Api
            id={apiId}
            projectId={projectId}
            height={height}
            onTabChange={setApiTabKey}
            activeKey={apiTabKey}
        />
    ), [ height, apiId, apiTabKey ]);

    // 搜索接口
    const handleSearchApi = _.debounce((e) => {
        // 获取不到e.target
        const input = document.getElementById('search-category-api');
        const value = input.value;

        setApiKeyWord(value);
    }, 100);

    // 组件加载完成
    useEffect(() => {
        (async () => {

        })();
    }, []);

    // 改变浏览器地址
    useEffect(() => {
        const query = {};
        if (categoryId) query.categoryId = categoryId;
        if (apiId) query.apiId = apiId;
        if (apiTabKey) query.apiTabKey = apiTabKey;

        const queryStr = Object.entries(query).map(([ key, value ]) => `${key}=${value}`).join('&');

        props.history.replace(`/projects/${projectId}/${activeKey}?${queryStr}`);
    }, [ activeKey, categoryId, apiId, apiTabKey ]);

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

    return (
        <>
            <TabPage
                loading={projectLoading}
                detailStyle={{ backgroundColor: color }}
                activeKey={activeKey}
                onChange={key => setActiveKey(key)}
                onHeightChange={setHeight}
                detail={(
                    <>
                        <div styleName="title">
                            <RoleTag role={userProjectRole}/>
                            <h1>{project.name}</h1>

                            {isProjectMaster ? (
                                <Button ghost onClick={() => setCategoryVisible(true) || setEditCategoryId(null)}>
                                    <FolderOpenOutlined/>
                                    创建分类
                                </Button>
                            ) : null}
                        </div>
                        <div styleName="description">
                            {project.description}
                        </div>
                        <Input
                            id="search-category-api"
                            allowClear
                            placeholder="输入分类、接口名称进行搜索"
                            onChange={handleSearchApi}
                        />
                    </>
                )}
                list={(
                    <CategoryMenu
                        selectedKey={apiId || categoryId}
                        projectId={projectId}
                        project={project}
                        isProjectMaster={isProjectMaster}
                        showModal={(id) => setCategoryVisible(true) || setEditCategoryId(id)}
                        keyWord={apiKeyWord}
                        onChange={type => {
                            setProject({ ...project });

                            if (type === 'delete') {

                            }
                            if (type === 'edit') {

                            }
                        }}
                        onClick={(key, type) => {
                            setActiveKey('api');

                            if (type === 'category' || key === 'all') {
                                setCategoryId(key);
                                setApiId(null);
                            }

                            if (type === 'api' && key !== 'all') {
                                setApiId(key);
                            }
                        }}
                    />
                )}
            >
                <TabPane tab={<span><ApiOutlined/> 接口</span>} key="api">
                    {apiId ? apiComponent : apiListComponent}
                </TabPane>
                <TabPane tab={<span><TeamOutlined/> 项目成员</span>} key="member"></TabPane>
                <TabPane tab={<span><SettingOutlined/> 设置</span>} key="setting"></TabPane>
                <TabPane tab={<span><SolutionOutlined/> 项目动态</span>} key="dynamic">
                    {dynamicComponent}
                </TabPane>
                <TabPane tab={<span><BookOutlined/> Wiki</span>} key="wiki"></TabPane>
            </TabPage>

            <CategoryModal
                visible={categoryVisible}
                projectId={projectId}
                id={editCategoryId}
                isEdit={!!editCategoryId}
                onOk={(data) => {
                    setCategoryVisible(false);
                    setProject({ ...project });
                    setCategoryId(data.id);
                }}
                onCancel={() => setCategoryVisible(false)}
            />
        </>
    );
});
