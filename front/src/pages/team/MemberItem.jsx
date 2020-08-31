import React from 'react';
import { Tooltip, Select, Popconfirm } from 'antd';
import {
    DeleteOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import { roleOptions } from 'src/commons';
import { UserAvatar } from 'src/library/components';
import './style-member.less';

export default config({})(props => {
    const {
        isMaster,
        user,
        data = {},
        onRoleChange,
        onDelete,
        onLeave,
    } = props;
    const { team_user: { role }, id, name, avatar, email } = data;
    const isSelf = user?.id === id;

    async function handleRoleChange(value) {
        onRoleChange && onRoleChange(data.id, value);
    }

    async function handleDelete() {
        onDelete && onDelete(data.id);
    }

    async function handleLeave() {
        onLeave && onLeave(data.id);
    }

    return (
        <div styleName="root">
            <div styleName="name">
                <UserAvatar styleName="avatar" src={avatar} name={name} alt="头像"/>
                {name}
            </div>
            <div styleName="email">{email}</div>
            <div styleName="role">
                {role === 'owner' ? '创建者' : (
                    isMaster ? (
                        <Select
                            value={role}
                            onChange={handleRoleChange}
                            style={{ width: 200 }}
                            placeholder="请选择成员角色"
                            options={roleOptions}
                        />
                    ) : roleOptions.find(item => item.value === role)?.label
                )}
            </div>
            <div styleName="operator">
                {isMaster && role !== 'owner' ? (
                    <Tooltip title="移除" placement="right">
                        <Popconfirm
                            okType="danger"
                            title={`您确定要移除成员「${name}」吗？`}
                            onConfirm={handleDelete}
                        >
                            <DeleteOutlined/>
                        </Popconfirm>
                    </Tooltip>
                ) : null}

                {isSelf ? (
                    <Tooltip title="离开" placement="right">
                        <Popconfirm
                            okType="danger"
                            title="您确定要离开吗？之后可以联系管理员重新加入"
                            onConfirm={handleLeave}
                        >
                            <LogoutOutlined/>
                        </Popconfirm>
                    </Tooltip>
                ) : null}
            </div>
        </div>
    );
});


