import React from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const map = {
    paramHeader: 'HTTP头信息，一般用于携带TOKEN、Cookie、数据类型等。',
    paramPath: '地址中携带的参数，一般DELETE、PUT请求使用。比如 DELETE /users/:id 中的id。',
    paramQuery: '地址中的查询字符串，一般GET请求使用。比如 GET /users?name=tom&age=23 中的name和age。',
    paramBody: 'HTTP请求体，一般POST、PUT请求使用。',

    httpPath: '支持动态路由，比如：GET /users/:id 或 Get /users/{id}。',
};

const Help = props => {
    const { title, type, style, ...others } = props;
    const label = map[type];

    if (!title && !label) return null;

    return (
        <Tooltip title={title || label}>
            <QuestionCircleOutlined {...others} style={{ margin: '0 4px', ...style }}/>
        </Tooltip>
    );
};

Help.propTypes = {
    title: PropTypes.any,
    type: PropTypes.oneOf(Object.keys(map)).isRequired,
};

export default Help;
