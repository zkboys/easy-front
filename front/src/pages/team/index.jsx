import React, { useEffect, useState } from 'react';
import config from 'src/commons/config-hoc';
import { Tabs, Menu, Tooltip, Empty, Button, Input, Modal } from 'antd';
import {
    TeamOutlined,
    AppstoreAddOutlined,
    UsergroupAddOutlined,
    FormOutlined,
    AppstoreOutlined,
    SolutionOutlined,
    UserAddOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import PageContent from 'src/layouts/page-content';
import { useGet, usePost, usePut, useDel } from 'src/commons/ajax';
import TeamModal from './TeamModal';
import ProjectModal from 'src/pages/project/ProjectModal';
import ProjectItem from 'src/pages/project/ProjectItem';
import MemberItem from 'src/pages/team/MemberItem';
import UserSelectModal from 'src/pages/users/UserSelectModal';

import './style.less';

const { TabPane } = Tabs;
const otherHeight = 176;

export default config({
    pageHead: false,
    path: '/teams/:teamId/:tabId',
    connect: true,
})(props => {
    const { user } = props;
    const { params } = props.match;
    const [ height, setHeight ] = useState(document.documentElement.clientHeight - otherHeight);
    const [ teamId, setTeamId ] = useState(params.teamId);
    const [ tabId, setTabId ] = useState(params.tabId === ':tabId' ? 'project' : params.tabId);
    const [ teams, setTeams ] = useState([]);
    const [ team, setTeam ] = useState({});
    // const [ teams, setTeams ] = useState([ { id: '1', name: '测试团队', description: '测试团队描述' }, { id: '2', name: '研发中心', description: '描述' } ]);
    const [ projects, setProjects ] = useState([]);
    const [ members, setMembers ] = useState([]);
    const [ dynamics, setDynamics ] = useState([]);
    const [ teamVisible, setTeamVisible ] = useState(false);
    const [ projectVisible, setProjectVisible ] = useState(false);
    const [ memberVisible, setMemberVisible ] = useState(false);
    const [ isTeamEdit, setIsTeamEdit ] = useState(false);

    const [ teamsLoading, fetchTeams ] = useGet('/teams');
    const [ teamLoading, fetchTeam ] = useGet('/teams/:id');
    const [ projectLoading, fetchProjects ] = useGet('/projects');
    const [ memberLoading, fetchMembers ] = useGet('/teams/:id/members');
    const [ addMemberLoading, addMembers ] = usePost('/teams/:id/members');
    const [ updateMemberLoading, updateMember ] = usePut('/teams/:id/members/:memberId');
    const [ deleteMemberLoading, deleteMember ] = useDel('/teams/:id/members/:memberId');
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
        return teams;
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

    function handleAddMember() {
        setMemberVisible(true);
    }

    // 添加成员
    async function handleAddMemberSubmit(values) {
        const { userId, role } = values;

        await addMembers({ id: teamId, userIds: userId, role }, { successTip: '添加成员成功！' });

        await getMembers();
        await getTeams();

        setMemberVisible(false);
    }

    // 修改成员
    async function handleMemberChange(memberId, role) {
        await updateMember({ id: teamId, memberId, role }, { successTip: '角色修改成功！' });

        await getMembers();
    }

    // 删除成员
    async function handleMemberDelete(memberId) {
        await deleteMember({ id: teamId, memberId }, { successTip: '删除成功！' });
        await getMembers();
        await getTeams();
    }

    async function handleMemberLeave(memberId) {
        await deleteMember({ id: teamId, memberId }, { successTip: '离开成功！' });

        props.history.replace('/');
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
    }, 100);

    const handleSearchMember = _.debounce((e) => {
        // 获取不到e.target
        const input = document.getElementById('search-member');
        const value = input.value;
        members.forEach(item => {
            const { name, account } = item;

            if (!value) return item._hide = false;

            item._hide = !name?.includes(value) && !account?.includes(value);
        });
        setProjects([ ...members ]);
    }, 100);

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
    }, 100);


    const handleWindowResize = _.debounce(() => {
        const windowHeight = document.documentElement.clientHeight;
        const height = windowHeight - otherHeight;
        setHeight(height);
    }, 100);

    const handlePopState = () => {
        const [ , , teamId, tabId ] = window.location.pathname.split('/');
        setTeamId(teamId);
        setTabId(tabId);
    };

    useEffect(() => {
        (async () => {
            const teams = await getTeams();

            if (teamId === ':teamId' && teams?.length) {
                handleMenuClick({ key: teams[0].id });
            }
        })();

        window.addEventListener('resize', handleWindowResize);
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // teamId改变 获取 team详情
    useEffect(() => {
        (async () => {
            if (!teamId || teamId === ':teamId') return;

            try {
                const team = await fetchTeam(teamId);
                if (!team) {
                    return Modal.info({
                        title: '提示',
                        content: '此团队已被删除！',
                        okText: '返回首页',
                        onOk: () => props.history.replace('/'),
                    });
                }
                setTeam(team);
            } catch (e) {
                if (e?.response?.status === 403) {
                    Modal.info({
                        title: '提示',
                        content: '您暂未加入此团队，请联系团队管理员将您加入！',
                        okText: '返回首页',
                        onOk: () => props.history.replace('/'),
                    });
                }
            }
        })();
    }, [ teamId ]);

    // teamId 或者 tabId 改变 获取对应的资源
    useEffect(() => {
        (async () => {
            if ((!teamId || teamId === ':teamId') && teams?.length) {
                return handleMenuClick({ key: teams[0]?.id });
            }

            if (!tabId || tabId === ':tabId') {
                return handleTabChange('project');
            }

            if (!teamId || teamId === ':teamId') return;

            if (tabId === 'project') await getProjects();
            if (tabId === 'member') await getMembers();
            if (tabId === 'dynamic') await getDynamics();
        })();
    }, [ teamId, tabId ]);


    const showProjects = projects.filter(item => !item._hide);
    const showTeams = teams.filter(item => !item._hide);
    const showMembers = members.filter(item => !item._hide);

    const isTeamMaster = user.isAdmin || team?.users?.find(item => item.id === user.id && ([ 'owner', 'master' ].includes(item.team_user?.role)));

    return (
        <PageContent
            styleName="root"
            loading={
                teamsLoading ||
                projectLoading ||
                memberLoading ||
                updateMemberLoading ||
                deleteMemberLoading ||
                dynamicLoading
            }
        >
            <div styleName="team-root">
                <div styleName="list" style={{ height: height + 94 }}>
                    <div styleName="top">
                        <div styleName="team-title">
                            <h1>{team.name}</h1>

                            {isTeamMaster ? (
                                <Tooltip title="修改团队" placement="right">
                                    <FormOutlined styleName="team-operator" onClick={handleEditTeam}/>
                                </Tooltip>
                            ) : null}

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
                            <div styleName="pan-operator">
                                <span style={{ flex: 1, marginLeft: 0 }}>
                                    当前团队共{members.length}个成员
                                </span>
                                <Input
                                    id="search-member"
                                    allowClear
                                    style={{ width: 200, height: 28 }}
                                    placeholder="输入成员名称进行搜索"
                                    onChange={handleSearchMember}
                                />
                                {isTeamMaster ? <Button type="primary" onClick={handleAddMember}> <UserAddOutlined/> 添加成员</Button> : null}
                            </div>
                            <div styleName="pan-content" style={{ height }}>
                                {showMembers?.length ? (
                                    showMembers.map(member => {
                                        return (
                                            <MemberItem
                                                isMaster={isTeamMaster}
                                                data={member}
                                                onRoleChange={handleMemberChange}
                                                onDelete={handleMemberDelete}
                                                onLeave={handleMemberLeave}
                                            />
                                        );
                                    })
                                ) : (
                                    <Empty
                                        styleName="empty"
                                        description={members?.length ? '无匹配成员' : '此团队还没有成员'}
                                    >
                                        {members?.length ? null : <Button type="primary" onClick={UserAddOutlined}> <AppstoreAddOutlined/> 添加成员</Button>}
                                    </Empty>
                                )}
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
                onOk={async (data) => {
                    console.log(data);
                    setProjectVisible(false);
                    await getProjects();

                    // TODO 项目创建成功之后，跳转到项目页面
                }}
                onCancel={() => setProjectVisible(false)}
            />
            <UserSelectModal
                loading={addMemberLoading}
                multiple
                exclude={team?.users?.map(item => item.id)}
                visible={memberVisible}
                onOk={handleAddMemberSubmit}
                onCancel={() => setMemberVisible(false)}
            />
        </PageContent>
    );
});
