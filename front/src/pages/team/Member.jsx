import React, { useEffect, useState } from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import UserSelectModal from 'src/pages/users/UserSelectModal';
import { useDel, useGet, usePost, usePut } from 'src/commons/ajax';
import _ from 'lodash';
import { Button, Empty, Input } from 'antd';
import { AppstoreAddOutlined, UserAddOutlined } from '@ant-design/icons';
import MemberItem from 'src/components/member-item';

export default config({ router: true })(props => {
    const { height, team, showAdd, user, onChange } = props;
    const [ members, setMembers ] = useState([]);
    const [ memberVisible, setMemberVisible ] = useState(false);

    const [ memberLoading, fetchMembers ] = useGet('/teams/:teamId/members');
    const [ addMemberLoading, addMembers ] = usePost('/teams/:teamId/members');
    const [ updateMemberLoading, updateMember ] = usePut('/teams/:teamId/members/:id');
    const [ deleteMemberLoading, deleteMember ] = useDel('/teams/:teamId/members/:id');
    const [ leaving, memberLeave ] = useDel('/teams/:teamId/membersLeave');

    const teamId = team?.id;

    async function getMembers() {
        if (!teamId) return;

        const members = await fetchMembers(teamId);

        // 将自己放在第一个
        const index = members.findIndex(item => item.id === user.id);
        if (index > -1) {
            const self = members.splice(index, 1)[0];
            members.unshift(self);
        }

        setMembers(members);
    }

    // 添加成员
    async function handleAddMember(values) {
        if (addMemberLoading) return;
        const { userId, role } = values;

        const data = await addMembers({ teamId, userIds: userId, role }, { successTip: '添加成员成功！' });

        await getMembers();

        setMemberVisible(false);
        onChange && onChange(data, 'add');
    }

    // 修改成员
    async function handleMemberChange(memberId, role) {
        if (updateMemberLoading) return;

        const data = await updateMember({ teamId, id: memberId, role }, { successTip: '角色修改成功！' });

        await getMembers();

        onChange && onChange(data, memberId === user.id ? 'updateSelf' : 'update');
    }

    // 删除成员
    async function handleMemberDelete(memberId) {
        if (deleteMemberLoading) return;

        const data = await deleteMember({ teamId, id: memberId }, { successTip: '删除成功！' });
        await getMembers();

        onChange && onChange(data, 'delete');
    }

    // 离开团队
    async function handleMemberLeave() {
        if (leaving) return;

        await memberLeave(teamId, { successTip: '离开成功！' });

        props.history.replace('/');
    }

    // 搜索成员
    const handleSearchMember = _.debounce((e) => {
        // 获取不到e.target
        const input = document.getElementById('search-member');
        const value = input.value;
        members.forEach(item => {
            const { name, account } = item;

            if (!value) return item._hide = false;

            item._hide = !name?.includes(value) && !account?.includes(value);
        });
        setMembers([ ...members ]);
    }, 100);

    useEffect(() => {
        (async () => {
            await getMembers();
        })();
    }, [ teamId ]);

    const showMembers = members.filter(item => !item._hide);
    const userTeamRole = team?.users?.find(item => item.id === user.id)?.team_user.role;
    const isTeamMaster = user.isAdmin || [ 'owner', 'master' ].includes(userTeamRole);

    return (
        <PageContent
            loading={
                memberLoading ||
                addMemberLoading ||
                updateMemberLoading ||
                deleteMemberLoading ||
                leaving
            }
            style={{ padding: 0, margin: 0 }}
        >
            <div className="pan-operator">
                <span style={{ flex: 1, marginLeft: 0 }}>
                    当前团队共{members.length}个成员
                </span>
                <Input
                    id="search-member"
                    allowClear
                    style={{ width: 200, height: 28 }}
                    placeholder="输入成员名称、账号进行搜索"
                    onChange={handleSearchMember}
                />
                {isTeamMaster && showAdd ? (
                    <Button
                        type="primary"
                        style={{ marginLeft: 8 }}
                        onClick={() => setMemberVisible(true)}
                    >
                        <UserAddOutlined/> 添加成员
                    </Button>
                ) : null}
            </div>
            <div className="pan-content" style={{ height, padding: 16 }}>
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
                        style={{ marginTop: 100 }}
                        description={members?.length ? '无匹配成员' : '此团队还没有成员'}
                    >
                        {showAdd ? <Button type="primary" onClick={() => setMemberVisible(true)}> <AppstoreAddOutlined/> 添加成员</Button> : null}
                    </Empty>
                )}
            </div>
            <UserSelectModal
                loading={addMemberLoading}
                multiple
                exclude={members?.map(item => item.id)}
                visible={memberVisible}
                onOk={handleAddMember}
                onCancel={() => setMemberVisible(false)}
            />
        </PageContent>
    );
});
