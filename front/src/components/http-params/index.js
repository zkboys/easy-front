import React from 'react';
import { Table, tableEditable } from 'src/library/components';
import PropTypes from 'prop-types';

const EditTable = tableEditable(Table);

const HttpParams = props => {
    const { value, onChange, ...others } = props;
    console.log(value);

    const columns = [
        {
            title: '字段名',
            dataIndex: 'key',
            formProps: {
                required: true,
            },
        },
        {
            title: '参数值',
            dataIndex: 'value',
            formProps: {
                required: true,
            },
        },
        {
            title: '是否必填',
            dataIndex: 'required',
            formProps: {
                type: 'radio-button',
                required: true,
                options: [
                    { label: '是', value: true },
                    { label: '否', value: false },
                ],
            },
        },
        {
            title: '描述',
            dataIndex: 'description',
            formProps: {
                type: 'textarea',
                required: true,
            },
        },
    ];
    return (
        <EditTable
            style={{ width: '100%' }}
            columns={columns}
            dataSource={value}
            {...others}
        />
    );
};

HttpParams.propTypes = {
    value: PropTypes.array,
};

export default HttpParams;
