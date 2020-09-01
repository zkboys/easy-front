import React, { useEffect, useState, useMemo } from 'react';
import config from 'src/commons/config-hoc';
import { Tabs, Menu, Tooltip, Empty, Button, Input, Modal, Popconfirm } from 'antd';
import {
    TeamOutlined,
    AppstoreAddOutlined,
    UsergroupAddOutlined,
    FormOutlined,
    AppstoreOutlined,
    SolutionOutlined,
    UserAddOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import PageContent from 'src/layouts/page-content';
import { useGet, usePost, usePut, useDel } from 'src/commons/ajax';
import TeamModal from './TeamModal';
import ProjectModal from 'src/pages/project/ProjectModal';
import ProjectItem from 'src/pages/project/ProjectItem';
import MemberItem from 'src/pages/team/MemberItem';
import UserSelectModal from 'src/pages/users/UserSelectModal';
import RoleTag from 'src/components/role-tag';
import TabPage from 'src/components/tab-page';
import Dynamic from 'src/components/dynamic';
import Project from './Project';
import Member from './Member';

import './style.less';

const { TabPane } = Tabs;

export default config({
    pageHead: false,
    path: '/teams/:teamId/:tabId',
    connect: true,
})(props => {
    const { user, match: { params } } = props;

    const [ activeKey, setActiveKey ] = useState('dynamic');
    const [ teamId, setTeamId ] = useState(params.teamId);
    const [ teams, setTeams ] = useState([]);
    const [ team, setTeam ] = useState({});
    const [ teamVisible, setTeamVisible ] = useState(false);
    const [ isTeamEdit, setIsTeamEdit ] = useState(false);

    const [ teamLoading, fetchTeam ] = useGet('/teams/:id');
    const [ teamsLoading, fetchTeams ] = useGet('/teams');
    const [ teamDeleteLoading, deleteTeam ] = useDel('/teams/:id');


    // 只用teamId 更新之后，Project才重新渲染
    const projectComponent = useMemo(() => <Project teamId={teamId}/>, [ teamId ]);

    // 只用teamId 更新之后，Member才重新渲染
    const memberComponent = useMemo(() => <Member teamId={teamId}/>, [ teamId ]);

    // 只用teamId, team 更新之后，Dynamic才重新渲染
    const dynamicComponent = useMemo(() => {
        return (
            <div
                className="pan-content"
            >
                <Dynamic url={`/teams/${teamId}/dynamics`} team={team}/>
            </div>
        );
    }, [ teamId, team ]);

    async function getTeams() {
        const teams = await fetchTeams();
        setTeams(teams);

        return teams;
    }


    async function handleDeleteTeam() {
        if (teamDeleteLoading) return;
        await deleteTeam(teamId, { successTip: '删除成功！' });
        const teams = await getTeams();

        // 还有团队 选中第一个
        if (teams?.length) {
            setTeamId(teams[0].id);
        } else {
            // 已经没有团队了 跳转首页
            props.history.replace('/');
        }
    }

    // 搜索团队
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

    useEffect(() => {
        (async () => {
            await getTeams();
        })();
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

                // 改变浏览器地址
                props.history.push(`/teams/${teamId}/${activeKey}`);
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


    const userTeamRole = team?.users?.find(item => item.id === user.id)?.team_user.role;
    const isTeamMaster = user.isAdmin || [ 'owner', 'master' ].includes(userTeamRole);
    const isTeamOwner = user.isAdmin || [ 'owner' ].includes(userTeamRole);
    const hasTeam = !!team?.name;

    const showTeams = teams.filter(item => !item._hide);

    return (
        <>
            <TabPage
                loading={
                    teamLoading ||
                    teamsLoading ||
                    teamDeleteLoading
                }
                activeKey={activeKey}
                onChange={key => setActiveKey(key)}
                detail={(
                    <>
                        <div styleName="team-title">
                            {hasTeam ? <RoleTag role={userTeamRole}/> : null}

                            {hasTeam ? <h1>{team.name}</h1> : <h1>没有任何团队，请点击图标创建 --></h1>}

                            {hasTeam && isTeamMaster ? (
                                <Tooltip title="修改团队">
                                    <FormOutlined
                                        styleName="team-operator"
                                        onClick={() => {
                                            setTeamVisible(true);
                                            setIsTeamEdit(true);
                                        }}
                                    />
                                </Tooltip>
                            ) : null}
                            {hasTeam && isTeamOwner ? (
                                <Tooltip title="删除团队">
                                    <Popconfirm
                                        okType="danger"
                                        title={(
                                            <>
                                                <div>您确定要删除此团队吗?</div>
                                                <div
                                                    style={{ marginTop: 8, fontSize: 14, color: 'red' }}
                                                >
                                                    团队下的所有项目、成员等信息也将被删除，请谨慎操作！
                                                </div>
                                            </>
                                        )}
                                        onConfirm={handleDeleteTeam}
                                    >
                                        <DeleteOutlined styleName="team-operator"/>
                                    </Popconfirm>
                                </Tooltip>
                            ) : null}

                            <Tooltip title="创建团队">
                                <UsergroupAddOutlined
                                    styleName="team-operator"
                                    onClick={() => {
                                        setTeamVisible(true);
                                        setIsTeamEdit(false);
                                    }}
                                />
                            </Tooltip>
                        </div>
                        <div styleName="team-description">
                            {hasTeam ? team.description : '点击创建自己的团队或者联系管理员将您加入相关团队'}
                        </div>
                        <Input
                            id="search-team"
                            allowClear
                            placeholder="输入团队名称进行搜索"
                            onChange={handleSearchTeam}
                        />
                    </>
                )}
                list={showTeams?.length ? (
                    <Menu
                        onClick={info => setTeamId(info.key)}
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
                        {teams?.length ? null : (
                            <Button
                                type="primary"
                                onClick={() => {
                                    setTeamVisible(true);
                                    setIsTeamEdit(false);
                                }}
                            >
                                <UsergroupAddOutlined/>创建团队
                            </Button>
                        )}
                    </Empty>
                )}
                tabs={[
                    // {
                    //     key: 'project',
                    //     title: <span><AppstoreOutlined/> 项目列表</span>,
                    //     content: props => (
                    //         <Project teamId={teamId} {...props}/>
                    //     ),
                    // },
                    //
                    // {
                    //     key: 'member',
                    //     title: <span><TeamOutlined/> 团队成员</span>,
                    //     content: props => (
                    //         <Project teamId={teamId} {...props}/>
                    //     ),
                    // },
                    {
                        key: 'dynamic',
                        title: <span><SolutionOutlined/> 团队动态</span>,
                        content: dynamicComponent,
                    },
                ]}
            >
                <TabPane tab={<span><AppstoreOutlined/> 项目列表</span>} key="project">
                    {projectComponent}
                </TabPane>
                <TabPane tab={<span><TeamOutlined/> 团队成员</span>} key="member">
                    {memberComponent}
                </TabPane>
                <TabPane tab={<span><SolutionOutlined/> 团队动态</span>} key="dynamic">
                    {dynamicComponent}
                </TabPane>
            </TabPage>
            <TeamModal
                visible={teamVisible}
                isEdit={isTeamEdit}
                id={teamId}
                onOk={async (data) => {
                    // 添加或修改成功

                    // 关闭弹框
                    setTeamVisible(false);

                    // 重新获取团队列表
                    await getTeams();

                    const { id } = data;

                    // 修改团队 重新获取团队详情
                    if (isTeamEdit) {
                        const team = await fetchTeam(id);
                        setTeam(team);
                        return;
                    }

                    // 添加 定位到最新添加的团队
                    setTeamId(id);
                }}
                onCancel={() => setTeamVisible(false)}
            />
        </>
    );
});
