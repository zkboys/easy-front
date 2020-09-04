import React, { useState } from 'react';
import { Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { FormOutlined, TeamOutlined, StarOutlined, DeleteOutlined, LogoutOutlined } from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import { getColor } from 'src/commons';
import RoleTag from 'src/components/role-tag';
import ProjectModal from './ProjectModal';
import './ProjectItemStyle.less';

export default config({})(props => {
    const { data = {}, onEdit, user } = props;
    const [ visible, setVisible ] = useState(false);

    const { id, name, description, team = {}, users = [] } = data;
    const color = getColor(data.name);
    const role = users.find(item => item.id === user.id)?.project_user?.role;
    const isMaster = user.isAdmin || [ 'owner', 'master' ].includes(role);

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
                                <DeleteOutlined/>
                            </Tooltip>
                        </>
                    ) : null}

                    <Tooltip title="收藏项目">
                        <StarOutlined/>
                    </Tooltip>

                    <Tooltip title="离开项目">
                        <LogoutOutlined/>
                    </Tooltip>
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
                    onEdit && onEdit(data);
                }}
                onCancel={() => setVisible(false)}
            />
        </div>
    );
});


