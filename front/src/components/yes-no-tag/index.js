import React from 'react';
import { Tag } from 'antd';
import PropTypes from 'prop-types';

const YesNoTag = props => {
    const { value } = props;

    const color = value ? 'red' : 'green';
    const label = value ? '是' : '否';

    return (
        <Tag color={color}>{label}</Tag>
    );
};

YesNoTag.propTypes = {
    value: PropTypes.bool,
};

export default YesNoTag;
