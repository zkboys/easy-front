import React, { useState, useEffect, useRef } from 'react';
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

    if (createNewRow) {
        // 新增一行
        handleAdd(true, record);
    } else {
        // 选中下一个
        if (isUp) nextTabIndex = tabIndex - 1;
        const nextInput = document.querySelector(`input[tabindex='${nextTabIndex}']`);

        if (!nextInput) return;

        // 确保方向键选中
        setTimeout(() => {
            nextInput.focus();
            nextInput.select();
        });
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
            'field',
            'valueType',
            'required',
            'description',
        ],
        ...others
    } = props;

    const [ expandedRowKeys, setExpandedRowKeys ] = useState([]);
    const [ maxTabIndex, setMaxTabIndex ] = useState(tabIndexStart);
    const [ lastAddId, setLastAddId ] = useState(null);
    const wrapEl = useRef(null);

    if (!fields.includes('_add')) fields.unshift('_add');
    if (!fields.includes('_operator')) fields.push('_operator');
    // if (!fields.includes('_tabIndex')) fields.push('_tabIndex');
    if (!value) value = [];


    const handleAdd = (append, record) => {
        if (!addable) return;
        let dataSource;
        if (Array.isArray(record)) dataSource = record;
        if (record && record._parentChildren) dataSource = record._parentChildren;
        if (!dataSource) return;

        // 数组只允许添加一个子级，用于描述数组元素即可
        if (record?._parent?.valueType === 'array' && record?._parent?.children?.length) return;

        const index = record ? dataSource.findIndex(item => item.id === record.id) : -1;
        const id = uuid();
        const newRecord = {
            id,
            parentId: record?._parent?.id,
            required: false,
            valueType: 'string',
            _isAdd: true,
            _addTime: Date.now(),
        };

        dataSource.splice(index + 1, 0, newRecord);

        onChange([ ...value ]);

        // 等待渲染
        setTimeout(() => {
            const nextInput = wrapEl.current.querySelector(`input[last='true']`);

            if (!nextInput) return;

            // 确保方向键选中
            setTimeout(() => {
                nextInput.focus();
                nextInput.select();
            });
        }, 10);
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
                    onClick={() => handleAdd(false, value)}
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
            dataIndex: 'field',
            width: 200,
            formProps: (record) => {
                if (disabledFields?.includes('field')) return;
                const tabIndex = record._tabIndex;
                return {
                    tabIndex,
                    noSpace: true,
                    rules: [
                        { required: true, message: '请输入字段名！' },
                        { pattern: /^[a-zA-Z_][a-zA-Z\d_]*$/, message: '字段名不合法！' },
                    ],
                    onFocus: handleFocus,
                    last: `${record.id === lastAddId}`,
                    onBlur: async (e) => {
                        record.field = e.target.value;
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
                    last: `${record.id === lastAddId}`,
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
                    last: `${record.id === lastAddId}`,
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
                const { id, field, valueType, children } = record;
                let addChild = [ 'object', 'array' ].includes(valueType);

                // 数组只允许添加一个子级，用来描述数组元素即可
                if (valueType === 'array' && children?.length) addChild = false;

                const items = [
                    {
                        label: '删除',
                        color: 'red',
                        icon: 'delete',
                        disabled: !deletable,
                        confirm: {
                            title: field ? `您确定删除字段「${field}」?` : '您确定删除此记录吗？',
                            onConfirm: () => handleDelete(id),
                        },
                    },
                    {
                        label: '添加子级',
                        icon: 'plus',
                        disabled: !addable || !addChild,
                        onClick: () => {
                            if (!children) record.children = [];

                            handleAdd(false, record.children);

                            // 展开父级
                            if (!expandedRowKeys.includes(id)) {
                                expandedRowKeys.push(id);
                                setExpandedRowKeys([ ...expandedRowKeys ]);
                            }
                        },
                    },
                ];

                return <Operator items={items}/>;
            },
        },
    ].filter(item => fields.includes(item.dataIndex));

    // 默认展开全部
    // useEffect(() => {
    //     const expandedRowKeys = [];
    //     const loop = nodes => {
    //         if (!nodes?.length) return;
    //
    //         nodes.forEach(node => {
    //             const { children, id } = node;
    //             if (children?.length) {
    //                 expandedRowKeys.push(id);
    //                 loop(children);
    //             }
    //         });
    //     };
    //     loop(value);
    //     setExpandedRowKeys(expandedRowKeys);
    //
    // }, []);

    // value 改变 计算tabIndex
    useEffect(() => {
        let max = 0;
        let lastTime = 0;
        const loop = (nodes, parentNode) => {
            if (!nodes?.length) return;

            nodes.forEach((node, index, arr) => {
                node._parentChildren = nodes;
                node._parent = parentNode;

                if (node._addTime && node._addTime > lastTime) {
                    lastTime = node._addTime;
                    setLastAddId(node.id);
                }

                node._tabIndex = tabIndexStart + max++;
                node._isLastRow = index === arr.length - 1 && !node.children?.length;

                if (node.children?.length) {
                    loop(node.children, node);
                }
            });
        };

        loop(value);

        setMaxTabIndex(max);
    }, [ value ]);
    return (
        <div ref={wrapEl} style={{ width: '100%' }}>
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
                    expandedRowKeys,
                    onExpand: (expanded, record) => {
                        const { id } = record;
                        if (expanded && !expandedRowKeys.includes(id)) {
                            expandedRowKeys.push(id);
                            setExpandedRowKeys([ ...expandedRowKeys ]);
                        }
                        if (!expanded) {
                            const keys = expandedRowKeys.filter(key => key !== id);
                            setExpandedRowKeys(keys);
                        }
                    },
                }}
                rowKey="id"
                {...others}
            />
        </div>
    );
};

HttpParams.propTypes = {
    value: PropTypes.array,
};

export default HttpParams;
