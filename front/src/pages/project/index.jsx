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
    ShareAltOutlined,
    BuildOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import { useGet } from 'src/commons/ajax';
import RoleTag from 'src/components/role-tag';
import TabPage from 'src/components/tab-page';
import Dynamic from 'src/components/dynamic';
import CategoryModal from 'src/pages/category/CategoryModal';
import CategoryMenu from 'src/pages/category/CategoryMenu';
import ApiList from 'src/pages/api/ApiList';
import Api from 'src/pages/api';
import Member from './Member';
import Edit from './Edit';
import Entity from './Entity';
import Wiki from './Wiki';
import Mind from './Mind';

import './indexStyle.less';
import { getColor } from 'src/commons';
import ApiModal from 'src/pages/api/ApiModal';

const { TabPane } = Tabs;

export default config({
    pageHead: false,
    path: '/projects/:projectId/:tabId',
    connect: true,
    query: true,
})(props => {
    const { user, match: { params }, query } = props;
    const { projectId } = params;

    const [ apiVisible, setApiVisible ] = useState(false);
    const [ height, setHeight ] = useState(0);
    const [ apiKeyWord, setApiKeyWord ] = useState(undefined);
    const [ refresh, setRefresh ] = useState({});

    const [ activeKey, setActiveKey ] = useState(params.tabId !== ':tabId' ? params.tabId : 'api');
    const [ categoryId, setCategoryId ] = useState(query.categoryId);
    const [ apiId, setApiId ] = useState(query.apiId);
    const [ apiTabKey, setApiTabKey ] = useState(query.apiTabKey);

    const [ project, setProject ] = useState({});
    const [ categoryVisible, setCategoryVisible ] = useState(false);
    const [ editCategoryId, setEditCategoryId ] = useState(null);

    const [ projectLoading, fetchProject ] = useGet('/projects/:id');

    const userProjectRole = project?.users?.find(item => item.id === user.id)?.project_user.role;
    const isProjectMaster = user.isAdmin || [ 'owner', 'master' ].includes(userProjectRole);
    // const isProjectOwner = user.isAdmin || [ 'owner' ].includes(userProjectRole);


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
            projectId={projectId}
            categoryId={categoryId}
            onChange={() => setProject({ ...project })}
            onCreateApi={() => setApiVisible(true)}
            onClick={record => setApiId(record.id)}
        />
    ), [ height, project, categoryId ]);

    const apiComponent = useMemo(() => (
        <Api
            id={apiId}
            projectId={projectId}
            height={height}
            onChange={() => setProject({ ...project })}
            onCreateApi={() => setApiVisible(true)}
            onTabChange={setApiTabKey}
            activeKey={apiTabKey}
        />
    ), [ height, apiId, apiTabKey ]);

    const editComponent = useMemo(() => (
        <div className="pan-content" style={{ height: height + 50 }}>
            <Edit
                id={projectId}
                height={height}
                onSubmit={async () => {
                    const project = await fetchProject(projectId);
                    setProject(project);
                    setRefresh({});
                }}/>
        </div>
    ), [ height, project ]);


    const entityComponent = useMemo(() => (
        <div className="pan-content" style={{ height: height + 50 }}>
            <Entity
                id={projectId}
                height={height}
                onSubmit={async () => {
                    const project = await fetchProject(projectId);
                    setProject(project);
                    setRefresh({});
                }}/>
        </div>
    ), [ height, project ]);

    const memberComponent = useMemo(() => (
        <Member
            height={height}
            projectId={projectId}
            project={project}
            onChange={async (data, type) => {
                // 团队成员的改变，间接的也是团队的改变，重新设置team，出发动态组件更新
                setProject({ ...project });
                if (type === 'updateSelf') {
                    const project = await fetchProject(projectId);
                    setProject(project);
                }

                setRefresh({});
            }}
        />
    ), [ height, projectId, project ]);

    const wikiComponent = useMemo(() => (
        <div className="pan-content" style={{ height: height + 50 }}>
            <Wiki readOnly={!isProjectMaster} projectId={projectId} height={height + 50} onSubmit={() => setProject({ ...project })}/>
        </div>
    ), [ height, project, isProjectMaster ]);
    const mindComponent = useMemo(() => (
        <div className="pan-content" style={{ height: height + 50 }}>
            <Mind
                readOnly={!isProjectMaster}
                projectId={projectId}
                height={height + 50}
                onSubmit={() => setProject({ ...project })}
            />
        </div>
    ), [ height, project, isProjectMaster ]);

    // 搜索接口
    const handleSearchApi = _.debounce((e) => {
        // 获取不到e.target
        const input = document.getElementById('search-category-api');
        const value = input.value;

        setApiKeyWord(value);
    }, 100);

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
    }, [ projectId, refresh ]);

    const color = getColor(project.name);

    const showToolCreate = activeKey === 'api';

    return (
        <>
            <TabPage
                loading={projectLoading}
                detailStyle={{ backgroundColor: color }}
                activeKey={activeKey}
                onChange={key => setActiveKey(key)}
                onHeightChange={setHeight}
                tool={showToolCreate ? (
                    <Button
                        type="primary"
                        style={{ marginLeft: 8 }}
                        onClick={() => setApiVisible(true)}
                    >
                        <ApiOutlined/> 创建接口
                    </Button>
                ) : null}
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
                <TabPane tab={<span><TeamOutlined/> 项目成员</span>} key="member">
                    {memberComponent}
                </TabPane>
                <TabPane tab={<span><SettingOutlined/> 设置</span>} key="setting">
                    {editComponent}
                </TabPane>
                <TabPane tab={<span><BuildOutlined /> 实体管理</span>} key="entity">
                    {entityComponent}
                </TabPane>
                <TabPane tab={<span><SolutionOutlined/> 项目动态</span>} key="dynamic">
                    {dynamicComponent}
                </TabPane>
                <TabPane tab={<span><BookOutlined/> 文档</span>} key="wiki">
                    {wikiComponent}
                </TabPane>
                <TabPane tab={<span><ShareAltOutlined/> 脑图</span>} key="mind">
                    {mindComponent}
                </TabPane>
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

            <ApiModal
                visible={apiVisible}
                projectId={projectId}
                categoryId={categoryId}
                onOk={data => {

                    // 如果当前url中apiId存在，创建接口之后，跳转到对应的 api页面
                    if (apiId) {
                        setApiId(data.id);
                        setApiTabKey('edit');
                    }
                    setApiVisible(false);
                    setProject({ ...project });
                }}
                onCancel={() => setApiVisible(false)}
            />
        </>
    );
});
