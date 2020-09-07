import React, { useState } from 'react';
import { Popconfirm, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { FormOutlined, TeamOutlined, DeleteOutlined, LogoutOutlined } from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import { getColor } from 'src/commons';
import RoleTag from 'src/components/role-tag';
import ProjectModal from './ProjectModal';
import './ProjectItemStyle.less';
import confirm from '@/components/confirm';
import { useDel } from '@/commons/ajax';

export default config({})(props => {
    const { data = {}, onChange, user } = props;
    const { id, name, description, team = {}, users = [] } = data;

    const [ visible, setVisible ] = useState(false);

    const [ deleting, deleteProject ] = useDel('/projects/:id', { successTip: '删除成功！' });
    const [ leaving, leaveProject ] = useDel('/projects/:id/membersLeave', { successTip: '离开成功！' });


    const handleDelete = async () => {
        if (deleting) return;
        await deleteProject(id);
        onChange();
    };

    const handleLeave = async () => {
        if (leaving) return;
        await leaveProject(id);
        onChange();
    };

    const color = getColor(data.name);
    const role = users.find(item => item.id === user.id)?.project_user?.role;
    const isMaster = user.isAdmin || [ 'owner', 'master' ].includes(role);
    const isSelf = users.some(item => item.id === user.id);

    return (
        <div styleName="root">
            <div styleName="content" style={{ backgroundColor: color }}>
                <div styleName="operator">
                    {isMaster ? (
                        <>
                            <Tooltip title="修改项目">
                                <FormOutlined onClick={() => setVisible(true)}/>
                            </Tooltip>
                            <Tooltip title="删除项目">
                                <DeleteOutlined
                                    disabled={deleting}
                                    onClick={async () => {
                                        await confirm(
                                            `您确定要删除项目「${name}」吗?`,
                                            `「${name}」项目下的所有接口、成员等信息也将被删除，请谨慎操作！`,
                                        );
                                        await handleDelete();
                                    }}/>
                            </Tooltip>
                        </>
                    ) : null}

                    {isSelf ? (
                        <Popconfirm
                            okType="danger"
                            title="您确定要离开吗？之后可以联系管理员重新加入"
                            onConfirm={handleLeave}
                        >
                            <LogoutOutlined/>
                        </Popconfirm>
                    ) : null}
                </div>

                <div styleName="title">
                    <Link to={`/projects/${id}/:tabId`}>{name}</Link>
                </div>
                <div styleName="description">
                    {description}
                </div>
            </div>

            <div styleName="footer" style={{ borderColor: color }}>
                <Link to={`/teams/${team.id}/project`}>
                    <TeamOutlined/>{team.name}
                </Link>
                <RoleTag role={role}/>
            </div>
            <ProjectModal
                visible={visible}
                id={id}
                isEdit={!!id}
                teamId={team.id}
                teams={[ team ]}
                disabledTeam
                onOk={async (data) => {
                    setVisible(false);
                    onChange(data);
                }}
                onCancel={() => setVisible(false)}
            />
        </div>
    );
});


