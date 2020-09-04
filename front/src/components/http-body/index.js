import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import { Table } from 'src/library/components';

const BodyForm = props => {
    return <Table/>;
};

// object array 多层级
const BodyJson = props => {
    return <Table/>;
};

const BodyFile = props => {
    return <Input.TextArea rows={6} {...props}/>;
};

const BodyRaw = props => {
    return <Input.TextArea rows={6} {...props}/>;
};

const map = {
    json: BodyJson,
    form: BodyForm,
    file: BodyFile,
    raw: BodyRaw,
};


const HttpBody = props => {
    const { type = 'json' } = props;
    const Component = map[type];

    return <Component {...props}/>;
};

HttpBody.propTypes = {
    type: PropTypes.oneOf(Object.keys(map)).isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func,
};

export default HttpBody;
