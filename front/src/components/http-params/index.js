import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { Operator, Table, tableEditable } from 'src/library/components';
import { valueTypeOptions } from 'src/commons';
import { v4 as uuid } from 'uuid';


const handleKeyDown = (e, tabIndex, dataSource, handleAdd) => {
    const { keyCode, ctrlKey, shiftKey, altKey, metaKey } = e;

    if (ctrlKey || shiftKey || altKey || metaKey) return;

    const length = dataSource?.length || 0;

    const isUp = keyCode === 38;
    const isRight = keyCode === 39;
    const isDown = keyCode === 40;
    const isLeft = keyCode === 37;
    const isEnter = keyCode === 13;

    let nextTabIndex;

    if (isDown || isEnter) {
        if (tabIndex === length || tabIndex === length * 2) {
            nextTabIndex = undefined;
        } else {
            nextTabIndex = tabIndex + 1;
        }
    }

    if (isUp) nextTabIndex = tabIndex - 1;

    if (isLeft) {
        if (tabIndex <= length) {
            nextTabIndex = tabIndex - 1 <= 0 ? undefined : tabIndex - 1 + length;
        } else {
            nextTabIndex = tabIndex - length;
        }
    }

    if (isRight) {
        if (tabIndex <= length) {
            nextTabIndex = tabIndex + length;
        } else {
            nextTabIndex = tabIndex - length === length ? undefined : tabIndex - length + 1;
        }
    }

    const nextInput = document.querySelector(`input[tabindex='${nextTabIndex}']`);

    if (nextInput) {
        // 确保方向键也可以选中
        setTimeout(() => {
            nextInput.focus();
            nextInput.select();
        });
    } else if (isEnter || isDown || isRight) {
        // 新增一行
        handleAdd(true);

        // 等待新增行渲染完成，新增行 input 获取焦点
        setTimeout(() => {
            let ti = tabIndex;

            if (isRight) ti = tabIndex - length;

            if ((isDown || isEnter) && tabIndex === length * 2) ti = tabIndex + 1;

            handleKeyDown({ keyCode: 13 }, ti, dataSource, handleAdd);
        });
    }
};

const EditTable = tableEditable(Table);

const HttpParams = props => {
    let { title, value, onChange, addable, deletable, ...others } = props;
    if (!value) value = [];

    console.log(value);

    const handleAdd = (append) => {
        const length = value.length;
        const key = `field${length + 1}`;
        const id = uuid();

        const newRecord = {
            id,
            key,
            required: false,
            isAdd: true,
            valueType: 'string',
        };

        append ? value.push(newRecord) : value.unshift(newRecord);
        onChange([ ...value ]);
    };

    const handleChange = async () => {
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
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <Button
                        disabled={!addable}
                        type="primary"
                        size="small"
                        style={{ marginRight: 16 }}
                        onClick={handleAdd}
                    >
                        添加一行
                    </Button>
                    <span>字段名</span>
                </div>
            ),
            dataIndex: 'key',
            width: 150,
            formProps: (record, index) => {
                const tabIndex = index + 1; // index * 2 + 2;
                return {
                    tabIndex,
                    autoFocus: true,
                    rules: [
                        { required: true, message: '请输入字段名！' },
                        { pattern: /^[a-zA-Z_][a-zA-Z\d_]*$/, message: '字段名不合法！' },
                    ],
                    onFocus: handleFocus,
                    onBlur: async (e) => {
                        record.key = e.target.value;
                        await handleChange();
                    },
                    onKeyDown: (e) => handleKeyDown(e, tabIndex, value, handleAdd),
                };
            },
        },
        {
            title: '类型',
            dataIndex: 'valueType',
            align: 'center',
            width: 150,
            formProps: (record) => {
                return {
                    required: true,
                    type: 'select',
                    options: valueTypeOptions,
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
            formProps: (record, index) => {
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
            title: '描述',
            dataIndex: 'description',
            formProps: (record, index) => {
                const length = value?.length || 0;

                const tabIndex = index + length * 1 + 1; // index * 2 + 2;
                return {
                    tabIndex,
                    onFocus: handleFocus,
                    onBlur: async (e) => {
                        record.description = e.target.value;
                        await handleChange();
                    },
                    onKeyDown: (e) => handleKeyDown(e, tabIndex, value, handleAdd),
                };
            },
        },
        {
            title: '操作', dataIndex: 'operator', width: 60,
            render: (value, record) => {
                const { id, key } = record;
                const items = [
                    {
                        label: '删除',
                        color: 'red',
                        disabled: !deletable,
                        confirm: {
                            title: `您确定删除字段「${key}」?`,
                            onConfirm: () => handleDelete(id),
                        },
                    },
                ];

                return <Operator items={items}/>;
            },
        },
    ];

    return (
        <EditTable
            surplusSpace={false}
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
