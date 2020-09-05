import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { Operator, Table, tableEditable } from 'src/library/components';
import { valueTypeOptions } from 'src/commons';
import YesNoTag from 'src/components/yes-no-tag';
import { v4 as uuid } from 'uuid';
import './style.less';


const handleKeyDown = (e, tabIndex, maxIndex, record, handleAdd, isRowLast) => {
    const { keyCode, ctrlKey, shiftKey, altKey, metaKey } = e;
    const isUp = keyCode === 38;
    const isDown = keyCode === 40;
    const isEnter = keyCode === 13;

    const createNewRow = (shiftKey || ctrlKey || metaKey) && isEnter;

    if (!createNewRow && (ctrlKey || shiftKey || altKey || metaKey)) return;

    if (!isUp && !isDown && !isEnter) return;

    let nextTabIndex = tabIndex + 1;

    const selectNext = () => {
        const nextInput = document.querySelector(`input[tabindex='${nextTabIndex}']`);

        if (!nextInput) return;

        // 确保方向键选中
        setTimeout(() => {
            nextInput.focus();
            nextInput.select();
        });
    };

    if (createNewRow) {
        // 新增一行
        handleAdd(true, record);

        // 等待渲染
        setTimeout(() => selectNext(), 10);
    } else {
        // 选中下一个
        if (isUp) nextTabIndex = tabIndex - 1;
        selectNext();
    }
};

const EditTable = tableEditable(Table);

const HttpParams = props => {
    let {
        tabIndexStart = 1,      // 防止一个页面出现多个 HttpParams 组件是 tabIndex重复问题
        title,
        value,
        onChange,
        addable = true,
        deletable = true,
        disabledFields = [],    // 不可编辑列
        fields = [              // 需要展示的列
            'key',
            'valueType',
            'required',
            'description',
        ],
        ...others
    } = props;

    const [ expandedRowKeys, setExpandedRowKeys ] = useState([]);
    const [ maxTabIndex, setMaxTabIndex ] = useState(tabIndexStart);

    if (!fields.includes('_add')) fields.unshift('_add');
    if (!fields.includes('_operator')) fields.push('_operator');
    // if (!fields.includes('_tabIndex')) fields.push('_tabIndex');
    if (!value) value = [];


    const handleAdd = (append, record) => {
        let dataSource;
        if (!record) dataSource = value;
        if (Array.isArray(record)) dataSource = record;
        if (record && record._parentChildren) dataSource = record._parentChildren;
        if (!dataSource) return;

        const index = record ? dataSource.findIndex(item => item.id === record.id) : value.length - 1;
        const id = uuid();
        const newRecord = {
            id,
            required: false,
            isAdd: true,
            valueType: 'string',
        };

        dataSource.splice(index + 1, 0, newRecord);

        onChange([ ...value ]);
    };

    const handleChange = () => {
        onChange([ ...value ]);
    };

    const handleFocus = (e) => {
        e.target.select();
    };

    const handleDelete = (id) => {
        const newValue = value.filter(item => item.id !== id);
        onChange([ ...newValue ]);
    };

    const columns = [
        {
            title: (
                <Button
                    disabled={!addable}
                    type="primary"
                    size="small"
                    onClick={() => handleAdd()}
                >
                    添加
                </Button>
            ),
            dataIndex: '_add',
            width: 50,
        },
        { title: 'tabIndex', dataIndex: '_tabIndex', render: (value, record) => `${value} - ${record._isLastRow}` },
        {
            title: '字段名',
            dataIndex: 'key',
            width: 200,
            formProps: (record) => {
                if (disabledFields?.includes('key')) return;
                const tabIndex = record._tabIndex;
                return {
                    tabIndex,
                    noSpace: true,
                    rules: [
                        { required: true, message: '请输入字段名！' },
                        { pattern: /^[a-zA-Z_][a-zA-Z\d_]*$/, message: '字段名不合法！' },
                    ],
                    onFocus: handleFocus,
                    onBlur: async (e) => {
                        record.key = e.target.value;
                        await handleChange();
                    },
                    onKeyDown: (e) => handleKeyDown(e, tabIndex, maxTabIndex, record, handleAdd, record._isLastRow),
                };
            },
        },
        {
            title: <span style={{ paddingLeft: 8 }}>字段值</span>,
            dataIndex: 'defaultValue',
            formProps: (record) => {
                if (disabledFields?.includes('defaultValue')) return;

                const tabIndex = record._tabIndex + maxTabIndex;
                return {
                    tabIndex,
                    placeholder: '请输入字段值',
                    onFocus: handleFocus,
                    onBlur: async (e) => {
                        record.defaultValue = e.target.value;
                        await handleChange();
                    },
                    onKeyDown: (e) => handleKeyDown(e, tabIndex, maxTabIndex, record, handleAdd, record._isLastRow),
                };
            },
        },
        {
            title: '类型',
            dataIndex: 'valueType',
            align: 'center',
            width: 150,
            formProps: (record) => {
                if (disabledFields?.includes('valueType')) return;
                return {
                    required: true,
                    type: 'select',
                    options: valueTypeOptions,
                    placeholder: '请选择类型',
                    onChange: (type) => {
                        record.valueType = type;
                        handleChange();
                    },
                };
            },
        },
        {
            title: '必填',
            dataIndex: 'required',
            align: 'center',
            width: 80,
            render: value => <YesNoTag value={value}/>,
            formProps: (record) => {
                if (disabledFields?.includes('required')) return;
                return {
                    type: 'checkbox',
                    required: true,
                    onChange: (val) => {
                        record.required = val;
                        handleChange();
                    },
                };
            },
        },
        {
            title: <span style={{ paddingLeft: 8 }}>描述</span>,
            dataIndex: 'description',
            formProps: (record) => {
                if (disabledFields?.includes('description')) return;

                const tabIndex = record._tabIndex + maxTabIndex * 2;
                return {
                    tabIndex,
                    placeholder: '请输入描述',
                    onFocus: handleFocus,
                    onBlur: async (e) => {
                        record.description = e.target.value;
                        await handleChange();
                    },
                    onKeyDown: (e) => handleKeyDown(e, tabIndex, maxTabIndex, record, handleAdd, record._isLastRow),
                };
            },
        },
        {
            title: '操作', dataIndex: '_operator', width: 70,
            render: (value, record) => {
                const { id, key, valueType } = record;
                const hasChildren = [ 'object', 'array-object' ].includes(valueType);
                const items = [
                    {
                        label: '删除',
                        color: 'red',
                        icon: 'delete',
                        disabled: !deletable,
                        confirm: {
                            title: key ? `您确定删除字段「${key}」?` : '您确定删除此记录吗？',
                            onConfirm: () => handleDelete(id),
                        },
                    },
                    {
                        label: '添加子级',
                        icon: 'plus',
                        disabled: !addable || !hasChildren,
                        onClick: () => {
                            if (!record.children) record.children = [];

                            handleAdd(false, record.children);
                        },
                    },
                ];

                return <Operator items={items}/>;
            },
        },
    ].filter(item => fields.includes(item.dataIndex));

    useEffect(() => {
        const expandedRowKeys = [];
        const loop = nodes => {
            if (!nodes?.length) return;

            nodes.forEach(node => {
                const { children, id } = node;
                if (children?.length) {
                    expandedRowKeys.push(id);
                    loop(children);
                }
            });
        };
        loop(value);
        setExpandedRowKeys(expandedRowKeys);

    }, [ value.length ]);

    // value 改变 计算tabIndex
    useEffect(() => {
        let max = 0;
        const loop = nodes => {
            if (!nodes?.length) return;

            nodes.forEach((node, index, arr) => {
                node._parentChildren = nodes;

                node._tabIndex = tabIndexStart + max++;
                node._isLastRow = index === arr.length - 1 && !node.children?.length;

                if (node.children?.length) {
                    loop(node.children);
                }
            });
        };

        loop(value);

        setMaxTabIndex(max);
    }, [ value ]);
    return (
        <EditTable
            styleName="root"
            locale={{
                // emptyText: '暂无数据',
            }}
            surplusSpace={false}
            style={{ width: '100%' }}
            columns={columns}
            dataSource={value}
            expandable={{
                // expandedRowKeys,
            }}
            rowKey="id"
            {...others}
        />
    );
};

HttpParams.propTypes = {
    value: PropTypes.array,
};

export default HttpParams;
