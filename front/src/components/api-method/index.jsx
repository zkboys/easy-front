import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { httpMethodOptions } from 'src/commons';

const ApiMethod = props => {
    let { method, ...others } = props;
    if (method) method = method.toLowerCase();
    const option = httpMethodOptions.find(item => item.value === method);
    const label = option?.label || method;
    const color = option?.color || 'grey';

    return (
        <Tag color={color} {...others}>{label}</Tag>
    );
};

ApiMethod.propTypes = {
    method: PropTypes.string,
};

export default ApiMethod;
