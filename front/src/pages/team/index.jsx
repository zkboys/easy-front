import React, { useEffect, useState, useMemo } from 'react';
import config from 'src/commons/config-hoc';
import { Tabs, Menu, Tooltip, Empty, Button, Input, Modal } from 'antd';
import {
    TeamOutlined,
    UsergroupAddOutlined,
    FormOutlined,
    AppstoreOutlined,
    SolutionOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import { useGet, useDel } from 'src/commons/ajax';
import TeamModal from './TeamModal';
import RoleTag from 'src/components/role-tag';
import TabPage from 'src/components/tab-page';
import Dynamic from 'src/components/dynamic';
import confirm from 'src/components/confirm';
import ProjectList from './ProjectList';
import Member from './Member';

import './style.less';
import { getColor, setPrimaryColor } from 'src/commons';

const { TabPane } = Tabs;

export default config({
    pageHead: false,
    path: '/teams/:teamId/:tabId',
    connect: true,
})(props => {
    const { user, match: { params } } = props;

    const [ refresh, setRefresh ] = useState(0);
    const [ height, setHeight ] = useState(0);
    const [ activeKey, setActiveKey ] = useState(params.tabId !== ':tabId' ? params.tabId : 'project');
    const [ teamId, setTeamId ] = useState(params.teamId);
    const [ teams, setTeams ] = useState([]);
    const [ team, setTeam ] = useState({});
    const [ teamVisible, setTeamVisible ] = useState(false);
    const [ isTeamEdit, setIsTeamEdit ] = useState(false);

    const [ teamLoading, fetchTeam ] = useGet('/teams/:id');
    const [ teamsLoading, fetchTeams ] = useGet('/teams');
    const [ teamDeleteLoading, deleteTeam ] = useDel('/teams/:id');

    // 只用teamId 更新之后，Project才重新渲染
    const projectComponent = useMemo(() => (
        <ProjectList
            height={height}
            showAdd={!!team}
            team={team}
            onChange={() => setTeam({ ...team })}
        />
    ), [ height, team ]);

    // 只用teamId 更新之后，Member才重新渲染
    const memberComponent = useMemo(() => (
        <Member
            height={height}
            showAdd={!!team}
            team={team}
            onChange={async (data, type) => {
                // 团队成员的改变，间接的也是团队的改变，重新设置team，出发动态组件更新
                setRefresh({});
                if (type === 'updateSelf') {
                    const team = await fetchTeam(teamId);
                    setTeam(team);
                }
            }}
        />
    ), [ height, team ]);

    // 只用teamId, team 更新之后，Dynamic才重新渲染
    const dynamicComponent = useMemo(() => (
        <div className="pan-content" style={{ height: height + 50 }}>
            <Dynamic url={`/teams/${team?.id ? team.id : ':teamId'}/dynamics`} team={team}/>
        </div>
    ), [ height, team ]);

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

    // 组件加载完成
    useEffect(() => {
        (async () => {
            const teams = await getTeams();
            if ((!teamId || teamId === ':teamId') && teams?.length) {
                const teamId = teams[0].id;
                setTeamId(teamId);
            }
            if (!teams?.length) setPrimaryColor(getColor());
        })();
    }, []);

    // 改变浏览器地址
    useEffect(() => {
        props.history.replace(`/teams/${teamId}/${activeKey}`);
    }, [ teamId, activeKey ]);

    // teamId改变 获取 team详情
    useEffect(() => {
        (async () => {
            if (!teamId || teamId === ':teamId') return;

            try {
                const team = await fetchTeam(teamId);
                if (!team) {
                    return Modal.confirm({
                        title: '提示',
                        content: '此团队已被删除！',
                        okText: '去首页',
                        onOk: () => props.history.replace('/'),
                        cancelText: '返回',
                        onCancel: () => props.history.goBack(),
                    });
                }

                setTeam(team);
                const color = getColor(team.name);
                setPrimaryColor(color);
            } catch (e) {
                if (e?.response?.status === 403) {
                    Modal.confirm({
                        title: '提示',
                        content: '您暂未加入此团队，请联系团队管理员将您加入！',
                        okText: '去首页',
                        onOk: () => props.history.replace('/'),
                        cancelText: '返回',
                        onCancel: () => props.history.goBack(),
                    });
                }
            }
        })();
    }, [ teamId, refresh ]);

    const userTeamRole = team?.users?.find(item => item.id === user.id)?.team_user.role;
    const isTeamMaster = user.isAdmin || [ 'owner', 'master' ].includes(userTeamRole);
    const isTeamOwner = user.isAdmin || [ 'owner' ].includes(userTeamRole);
    const hasTeam = !!team?.name;

    const showTeams = teams.filter(item => !item._hide);

    const color = getColor(team.name);
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
                onHeightChange={setHeight}
                detailStyle={{ backgroundColor: color }}
                detail={(
                    <>
                        <div styleName="title">
                            {hasTeam ? <RoleTag role={userTeamRole}/> : null}

                            {hasTeam ? <h1>{team.name}</h1> : <h1>没有任何团队，请点击图标创建 --></h1>}

                            {hasTeam && isTeamMaster ? (
                                <Tooltip title="修改团队">
                                    <FormOutlined
                                        styleName="operator"
                                        onClick={() => {
                                            setTeamVisible(true);
                                            setIsTeamEdit(true);
                                        }}
                                    />
                                </Tooltip>
                            ) : null}
                            {hasTeam && isTeamOwner ? (
                                <Tooltip title="删除团队">
                                    <DeleteOutlined
                                        styleName="operator"
                                        onClick={async () => {
                                            await confirm({
                                                title: `您确定要删除团队「${team.name}」吗?`,
                                                content: `「${team.name}」团队下的所有项目、成员等信息也将被删除，请谨慎操作！`,
                                            });
                                            await handleDeleteTeam();
                                        }}
                                    />
                                </Tooltip>
                            ) : null}

                            <Tooltip title="创建团队">
                                <UsergroupAddOutlined
                                    styleName="operator"
                                    onClick={() => {
                                        setTeamVisible(true);
                                        setIsTeamEdit(false);
                                    }}
                                />
                            </Tooltip>
                        </div>
                        <div styleName="description">
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
                        style={{ marginTop: 100 }}
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
