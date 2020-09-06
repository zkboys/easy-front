import React from 'react';
import PropTypes from 'prop-types';
import { TreeSelect } from 'antd';
import { mockStations } from 'src/commons';

const { TreeNode } = TreeSelect;

const MockStationSelect = props => {
    const { value, onChange, ...others } = props;

    return (
        <TreeSelect
            showSearch
            value={value}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder="请选择Mock占位符"
            allowClear
            treeDefaultExpandAll
            onChange={onChange}
            {...others}
        >
            {mockStations?.length && mockStations.map(item => {
                const { label, value, children } = item;
                return (
                    <TreeNode value={value} title={label} selectable={false}>
                        {children?.length && children.map(it => {
                            return <TreeNode value={it.value} title={it.label}/>;
                        })}
                    </TreeNode>
                );
            })}
        </TreeSelect>
    );
};

MockStationSelect.propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func,
};

export default MockStationSelect;
