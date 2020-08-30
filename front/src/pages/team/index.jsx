import React, { useEffect, useState } from 'react';
import config from 'src/commons/config-hoc';
import { Tabs, Menu, Tooltip, Empty, Button, Input } from 'antd';
import {
    TeamOutlined,
    AppstoreAddOutlined,
    UsergroupAddOutlined,
    FormOutlined,
    AppstoreOutlined,
    SolutionOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import PageContent from 'src/layouts/page-content';
import { useGet } from 'src/commons/ajax';
import TeamModal from './TeamModal';
import ProjectModal from 'src/pages/project/ProjectModal';
import ProjectItem from 'src/pages/project/ProjectItem';

import './style.less';

const { TabPane } = Tabs;
const otherHeight = 176;

export default config({
    pageHead: false,
    path: '/teams/:teamId/:tabId',
    connect: true,
})(props => {
    const { params } = props.match;
    const [ height, setHeight ] = useState(document.documentElement.clientHeight - otherHeight);
    const [ teamId, setTeamId ] = useState(params.teamId);
    const [ tabId, setTabId ] = useState(params.tabId === ':tabId' ? 'project' : params.tabId);
    // const [ teams, setTeams ] = useState([]);
    const [ teams, setTeams ] = useState([ { id: '1', name: '测试团队', description: '测试团队描述' }, { id: '2', name: '研发中心', description: '描述' } ]);
    const [ projects, setProjects ] = useState([]);
    const [ members, setMembers ] = useState([]);
    const [ dynamics, setDynamics ] = useState([]);
    const [ teamVisible, setTeamVisible ] = useState(false);
    const [ projectVisible, setProjectVisible ] = useState(false);
    const [ isTeamEdit, setIsTeamEdit ] = useState(false);

    const [ teamsLoading, fetchTeams ] = useGet('/teams');
    const [ projectLoading, fetchProjects ] = useGet('/projects');
    const [ memberLoading, fetchMembers ] = useGet('/teams/:id/members');
    const [ dynamicLoading, fetchDynamics ] = useGet('/teams/:id/dynamics');


    function handleTabChange(key) {
        setTabId(key);
        props.history.push(`/teams/${teamId}/${key}`);
    }

    function handleMenuClick(info) {
        const { key } = info;
        setTeamId(key);
        props.history.push(`/teams/${key}/${tabId}`);
    }

    async function getTeams() {
        const teams = await fetchTeams();
        setTeams(teams);
    }

    async function getProjects() {
        const projects = await fetchProjects({ teamId });
        setProjects(projects);
    }

    async function getMembers() {
        const members = await fetchMembers(teamId);
        setMembers(members);
    }

    async function getDynamics() {
        const dynamics = await fetchDynamics(teamId);
        setDynamics(dynamics);
    }

    function handleCreateTeam() {
        setTeamVisible(true);
        setIsTeamEdit(false);
    }

    function handleEditTeam() {
        setTeamVisible(true);
        setIsTeamEdit(true);
    }

    function handleCreateProject() {
        setProjectVisible(true);
    }

    const handleSearchProject = _.debounce((e) => {
        // 获取不到e.target
        const input = document.getElementById('search-project');
        const value = input.value;
        projects.forEach(item => {
            const { name } = item;

            if (!value) return item._hide = false;

            item._hide = !name?.includes(value);
        });
        setProjects([ ...projects ]);
    }, 300);

    const handleSearchTeam = _.debounce((e) => {
        // 获取不到e.target
        const input = document.getElementById('search-team');
        const value = input.value;
        teams.forEach(item => {
            const { name } = item;

            if (!value) return item._hide = false;

            item._hide = !name?.includes(value);
        });
        setTeams([ ...teams ]);
    }, 300);


    const handleWindowResize = _.debounce(() => {
        const windowHeight = document.documentElement.clientHeight;
        const height = windowHeight - otherHeight;
        setHeight(height);
    }, 100);

    useEffect(() => {
        (async () => {
            const teams = await getTeams();

            if (teamId === ':teamId' && teams.length) {
                handleMenuClick({ key: teams[0].id });
            }
        })();

        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);


    // teamId 或者 tabId 改变 获取对应的资源
    useEffect(() => {
        (async () => {
            if (!teamId || teamId === ':teamId' || !tabId || tabId === ':tabId') return;

            if (tabId === 'project') await getProjects();
            if (tabId === 'member') await getMembers();
            if (tabId === 'dynamic') await getDynamics();
        })();
    }, [ teamId, tabId ]);

    const team = teams.find(item => item.id === teamId) || { name: '暂无团队' };
    const showProjects = projects.filter(item => !item._hide);
    const showTeams = teams.filter(item => !item._hide);

    return (
        <PageContent
            styleName="root"
            loading={
                teamsLoading ||
                projectLoading ||
                memberLoading ||
                dynamicLoading
            }
        >
            <div styleName="team-root">
                <div styleName="list" style={{ height: height + 94 }}>
                    <div styleName="top">
                        <div styleName="team-title">
                            <h1>{team.name}</h1>

                            {/* TODO 只有管理员才可以修改 */}
                            <Tooltip title="修改团队" placement="right">
                                <FormOutlined styleName="team-operator" onClick={handleEditTeam}/>
                            </Tooltip>

                            <Tooltip title="创建团队" placement="right">
                                <UsergroupAddOutlined styleName="team-operator" onClick={handleCreateTeam}/>
                            </Tooltip>
                        </div>
                        <div styleName="team-description">
                            {team.description}
                        </div>
                        <Input
                            id="search-team"
                            allowClear
                            placeholder="输入团队名称进行搜索"
                            onChange={handleSearchTeam}
                        />
                    </div>
                    <div styleName="menu">
                        {showTeams?.length ? (
                            <Menu
                                onClick={handleMenuClick}
                                style={{ width: '100%' }}
                                selectedKeys={[ teamId ]}
                                mode="inline"
                            >
                                {showTeams.map(item => <Menu.Item key={item.id}><TeamOutlined/> {item.name}</Menu.Item>)}
                            </Menu>
                        ) : (
                            <Empty
                                styleName="empty"
                                description={teams?.length ? '无匹配团队' : '您未创建、未加入任何团队'}
                            >
                                {teams?.length ? null : <Button type="primary" onClick={handleCreateTeam}><UsergroupAddOutlined/>创建团队</Button>}
                            </Empty>
                        )}
                    </div>
                </div>
                <div styleName="detail">
                    <Tabs onChange={handleTabChange} activeKey={tabId} type="card">
                        <TabPane tab={<span><AppstoreOutlined/> 项目列表</span>} key="project">
                            <div styleName="pan-operator">
                                <span style={{ flex: 1, marginLeft: 0 }}>
                                    当前团队共{projects.length}个项目
                                </span>
                                <Input
                                    id="search-project"
                                    allowClear
                                    style={{ width: 200, height: 28 }}
                                    placeholder="输入项目名称进行搜索"
                                    onChange={handleSearchProject}
                                />
                                <Button type="primary" onClick={handleCreateProject}> <AppstoreAddOutlined/> 创建项目</Button>
                            </div>
                            <div styleName="pan-content" style={{ height }}>
                                {showProjects?.length ? (
                                    <div styleName="project-wrap">
                                        {showProjects.map(project => (
                                            <ProjectItem
                                                key={project.id}
                                                data={project}
                                                onEdit={data => {
                                                    Object.entries(data).forEach(([ key, value ]) => {
                                                        if (key in project) project[key] = value;
                                                    });
                                                    setProjects([ ...projects ]);
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <Empty
                                        styleName="empty"
                                        description={projects?.length ? '无匹配项目' : '您未加入任何团队项目'}
                                    >
                                        {projects?.length ? null : <Button type="primary" onClick={handleCreateProject}> <AppstoreAddOutlined/> 创建项目</Button>}
                                    </Empty>
                                )}
                            </div>
                        </TabPane>
                        <TabPane tab={<span><TeamOutlined/> 团队成员</span>} key="member">
                            <div styleName="pan-content" style={{ height }}>
                                这里是团队成员
                            </div>
                        </TabPane>
                        <TabPane tab={<span><SolutionOutlined/> 团队动态</span>} key="dynamic">
                            <div styleName="pan-content" style={{ height }}>
                                这里是团队动态
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
            <TeamModal
                visible={teamVisible}
                isEdit={isTeamEdit}
                id={teamId}
                onOk={async (data) => {
                    const { id: teamId } = data;

                    await getTeams();
                    await getProjects();

                    handleMenuClick({ key: teamId });
                    setTeamVisible(false);
                }}
                onCancel={() => setTeamVisible(false)}
            />
            <ProjectModal
                visible={projectVisible}
                teamId={teamId}
                teams={teams}
                disabledTeam
                onOk={async () => {
                    setProjectVisible(false);
                    await getProjects();
                }}
                onCancel={() => setProjectVisible(false)}
            />
        </PageContent>
    );
});
