import React, { useState } from 'react';
import { Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { FormOutlined, TeamOutlined, StarOutlined, DeleteOutlined, LogoutOutlined } from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import { getColor } from 'src/commons';
import ProjectModal from './ProjectModal';
import './style-item.less';

export default config({})(props => {
    const { data = {}, onEdit } = props;
    const [ visible, setVisible ] = useState(false);

    const { id, name, description, team = {} } = data;

    const color = getColor(team.name);

    return (
        <div styleName="root">
            <div styleName="content" style={{ backgroundColor: color }}>
                <div styleName="operator">
                    <Tooltip title="修改项目">
                        <FormOutlined onClick={() => setVisible(true)}/>
                    </Tooltip>

                    <Tooltip title="删除项目">
                        <DeleteOutlined/>
                    </Tooltip>

                    <Tooltip title="收藏项目">
                        <StarOutlined/>
                    </Tooltip>

                    <Tooltip title="离开项目">
                        <LogoutOutlined/>
                    </Tooltip>
                </div>

                <div styleName="title">
                    <a href="">{name}</a>
                </div>
                <div styleName="description">
                    {description}
                </div>
            </div>

            <div styleName="footer" style={{
                borderColor: color,
            }}>
                <Link to={`/teams/${team.id}/project`}>
                    <TeamOutlined/>{team.name}
                </Link>
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


