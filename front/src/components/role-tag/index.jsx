import React from 'react';
import { Tag } from 'antd';
import { roleOptions } from 'src/commons';

export default props => {
    const { role } = props;
    let { label, color } = roleOptions.find(item => item.value === role) || {};

    if (role === 'owner') {
        label = '自建';
        color = '#87d068';
    }

    if (!role) {
        label = '暂未加入';
        color = '#999';
    }

    return <Tag color={color}>{label}</Tag>;
}
