import React from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const Help = props => {
    const { title, style } = props;
    return (
        <Tooltip title={title}>
            <QuestionCircleOutlined {...props} style={{ marginLeft: 4, ...style }}/>
        </Tooltip>
    );
};

Help.propTypes = {
    title: PropTypes.any,
};

Help.HttpParamHeader = props => <Help title="HTTP头信息，一般用于设置token" {...props}/>;
Help.HttpParamPath = props => <Help title="地址中携带的参数，一般DELETE、PUT请求使用。比如 DELETE /users/:id 中的id" {...props}/>;
Help.HttpParamQuery = props => <Help title="地址中的查询字符串，一般GET请求使用。比如 GET /users?name=tom&age=23 中的name和age" {...props}/>;
Help.HttpParamBody = props => <Help title="HTTP请求体，一般POST、PUT请求使用。" {...props}/>;

export default Help;
