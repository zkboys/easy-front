import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { valueTypeOptions } from 'src/commons';


const ValueType = props => {
    const { type, tag } = props;
    const option = valueTypeOptions.find(item => item.value === type);
    const label = option?.label;
    const color = option?.color;

    if (label && tag) return <Tag color={color}>{label}</Tag>;

    return (<span>{label || '-'}</span>);
};

ValueType.propTypes = {
    type: PropTypes.string,
    tag: PropTypes.bool,
};

export default ValueType;
