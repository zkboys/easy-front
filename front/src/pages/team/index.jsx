import React, { useEffect, useState } from 'react';
import config from 'src/commons/config-hoc';
import { Tabs, Menu, Tooltip, Empty, Button } from 'antd';
import { TeamOutlined, AppstoreAddOutlined, FormOutlined } from '@ant-design/icons';
import _ from 'lodash';
import PageContent from 'src/layouts/page-content';
import { useGet } from '@/commons/ajax';
import TeamModal from './TeamModal';
import ProjectModal from './ProjectModal';

import './style.less';

const { TabPane } = Tabs;
const otherHeight = 126;

export default config({
    pageHead: false,
    path: '/team/:teamId/:tabId',
    connect: true,
})(props => {
    const [ height, setHeight ] = useState(document.documentElement.clientHeight - otherHeight);
    const [ teamId, setTeamId ] = useState('');
    const [ tabId, setTabId ] = useState('');
    // const [ teams, setTeams ] = useState([]);
    const [ teams, setTeams ] = useState([ { id: '1', name: '测试团队', description: '测试团队描述' }, { id: '2', name: '研发中心', description: '描述' } ]);
    const [ projects, setProjects ] = useState([]);
    const [ members, setMembers ] = useState([]);
    const [ dynamics, setDynamics ] = useState([]);
    const [ teamVisible, setTeamVisible ] = useState(false);
    const [ projectVisible, setProjectVisible ] = useState(false);
    const [ isTeamEdit, setIsTeamEdit ] = useState(false);

    const [ teamsLoading, fetchTeams ] = useGet('/teams');
    const [ projectLoading, fetchProjects ] = useGet('/teams/:id/projects');
    const [ memberLoading, fetchMembers ] = useGet('/teams/:id/members');
    const [ dynamicLoading, fetchDynamics ] = useGet('/teams/:id/dynamics');


    function handleTabChange(key) {
        setTabId(key);
        props.history.push(`/team/${teamId}/${key}`);
    }

    function handleMenuClick(info) {
        const { key } = info;
        setTeamId(key);
        props.history.push(`/team/${key}/${tabId}`);
    }

    async function getProjects() {
        const projects = await fetchProjects(teamId);
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

    const handleWindowResize = _.debounce(() => {
        const windowHeight = document.documentElement.clientHeight;
        const height = windowHeight - otherHeight;
        console.log(height);
        setHeight(height);
    }, 100);

    useEffect(() => {
        (async () => {
            const { teamId, tabId } = props.match.params;
            setTabId(tabId === ':tabId' ? 'project' : tabId);
            setTeamId(teamId === ':teamId' ? '' : teamId);

            const teams = await fetchTeams();
            setTeams(teams);

            if (teamId === ':teamId' && teams.length) setTeamId(teamId);
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
                <div styleName="list" style={{ height: height + 44 }}>
                    <div styleName="top">
                        <div styleName="team-title">
                            <h1>{team.name}</h1>
                            <Tooltip title="修改团队" placement="right">
                                <FormOutlined styleName="team-operator" onClick={handleEditTeam}/>
                            </Tooltip>

                            <Tooltip title="创建团队" placement="right">
                                <AppstoreAddOutlined styleName="team-operator" onClick={handleCreateTeam}/>
                            </Tooltip>
                        </div>
                        <div styleName="team-description">
                            {team.description}
                        </div>
                    </div>
                    <div styleName="menu">
                        {teams?.length ? (
                            <Menu
                                onClick={handleMenuClick}
                                style={{ width: '100%' }}
                                selectedKeys={[ teamId ]}
                                mode="inline"
                            >
                                {teams.map(item => <Menu.Item key={item.id}><TeamOutlined/> {item.name}</Menu.Item>)}
                            </Menu>
                        ) : (
                            <Empty
                                styleName="empty"
                                description="您未创建、未加入任何团队"
                            >
                                <Button type="primary" onClick={handleCreateTeam}>创建团队</Button>
                            </Empty>
                        )}
                    </div>
                </div>
                <div styleName="detail">
                    <Tabs onChange={handleTabChange} activeKey={tabId} type="card">
                        <TabPane tab="项目列表" key="project">
                            <div styleName="pan-content" style={{ height }}>
                                {projects?.length ? ('项目列表') : (
                                    <Empty
                                        styleName="empty"
                                        description="您未加入任何团队项目"
                                    >
                                        <Button type="primary" onClick={handleCreateProject}>创建项目</Button>
                                    </Empty>
                                )}
                            </div>
                        </TabPane>
                        <TabPane tab="团队成员" key="member">
                            <div styleName="pan-content" style={{ height }}>
                                这里是团队成员
                            </div>
                        </TabPane>
                        <TabPane tab="团队动态" key="dynamic">
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
                onOk={(data) => {
                    const { id: teamId } = data;
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
