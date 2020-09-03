import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { roleOptions } from 'src/commons';

const RoleTag = props => {
    const { role } = props;
    let { label, color } = roleOptions.find(item => item.value === role) || {};

    if (role === 'owner') {
        label = '自建';
        color = '#87d068';
    }

    if (!role) {
        label = '未加入';
        color = '#999';
    }

    return <Tag color={color}>{label}</Tag>;
};
RoleTag.propTypes = {
    role: PropTypes.object,
};
export default RoleTag;
