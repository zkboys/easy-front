import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Modal, Tree } from 'antd';
import confirm from '@/components/confirm';

import './style.less';

const { TreeNode } = Tree;

const TreeEditor = props => {
    const {
        dataSource,
        readOnly,
        selectedKey,
        onClick,
        onAdd,
        onDelete,
        onSave,
        ...others
    } = props;
    const [ expandedKeys, setExpandedKeys ] = useState([]);
    const [ blurToSave, setBlurToSave ] = useState(false);

    async function handleKeyDown(e, node) {
        const { target: { value }, keyCode, metaKey, ctrlKey, shiftKey } = e;
        const isEnter = keyCode === 13;
        const isDelete = keyCode === 46;
        const { key, parentKey } = node;

        if ((metaKey || ctrlKey) && isDelete) {
            // 删除
            await handleDelete(e, node);
            return;
        }

        if (isEnter) {
            node.title = value;

            if (!value) return;

            // 保存当前目录
            if (!metaKey && !ctrlKey && !shiftKey) {
                onSave && await onSave(e, node);
                setBlurToSave(false);
                return;
            }

            // 添加节点 按住shift 添加的是子节点
            if (metaKey || ctrlKey) {
                const parentKey = shiftKey ? key : parentKey;
                dataSource.forEach(item => item.autoFocus = false);
                onAdd && await onAdd(e, parentKey);

                // 添加子级的时候，展开父级节点
                if (shiftKey && !expandedKeys.includes(key)) {
                    setExpandedKeys([ ...expandedKeys, key ]);
                }
            }
        }
    }

    async function handleDelete(e, node) {
        if (dataSource?.length === 1) {
            return Modal.info({
                title: '提示',
                content: '必须保留一个节点！',
            });
        }
        await confirm({
            title: '提示',
            content: `您确定删除「${node.title}」?如果存在子级，也全部删除，请谨慎操作！`,
        });

        const nodesToDelete = [];
        const loop = node => {
            nodesToDelete.push(node);
            const children = dataSource.filter(item => item.parentKey === node.key);
            if (children?.length) {
                children.forEach(item => loop(item));
            }
        };

        loop(node);

        const keysToDelete = nodesToDelete.map(item => item.key);

        onDelete && await onDelete(keysToDelete);

        const otherDataSource = dataSource.filter(item => !keysToDelete.includes(item.key));

        if (otherDataSource?.length) {
            // 选中
            const children = dataSource.filter(item => item.parentKey === node.parentKey);
            let selectedNode = otherDataSource[0];

            if (children?.length === 1) {
                if (node.parentKey) {
                    selectedNode = otherDataSource.find(item => item.key === node.parentKey);
                } else {
                    selectedNode = otherDataSource[0];
                }
            }

            if (children?.length > 1) {
                const deletedIndex = dataSource.findIndex(item => item.key === node.key);
                selectedNode = otherDataSource[deletedIndex] || otherDataSource[deletedIndex - 1];
            }
            console.log(999, selectedNode);

            onClick && await onClick(null, selectedNode);
        }
    }

    // 目录失去焦点
    async function handleBlur(e, node) {
        const { value } = e.target;

        if (blurToSave) {
            node.title = value;
            // 保存目录
            onSave && await onSave(e, node);
            setBlurToSave(false);
        }
    }


    let treeNodes = null;
    if (dataSource?.length) {
        const loop = nodes => {
            return nodes.map(node => {
                const {
                    key,
                    title,
                    autoFocus,
                } = node;
                const children = dataSource.filter(item => item.parentKey === key);
                const active = selectedKey === key;

                let nodeTitle = (readOnly) ? (
                    <span onClick={e => onClick && onClick(e, node)}>{title}</span>
                ) : (
                    <Input
                        autoFocus={autoFocus}
                        id={`input_${key}`}
                        styleName={`content-input ${active ? 'active' : ''}`}
                        defaultValue={title}
                        onKeyDown={e => handleKeyDown(e, node)}
                        onChange={() => setBlurToSave(true)}
                        onBlur={e => handleBlur(e, node)}
                        onClick={e => onClick && onClick(e, node)}
                    />
                );

                if (children?.length) {
                    return (
                        <TreeNode
                            key={key}
                            title={nodeTitle}
                        >
                            {loop(children)}
                        </TreeNode>
                    );
                }

                return (
                    <TreeNode key={key} title={nodeTitle}/>
                );
            });
        };

        treeNodes = loop(dataSource.filter(item => !item.parentKey));
    }

    return (
        <Tree
            selectable={false}
            defaultExpandAll
            expandedKeys={expandedKeys}
            onExpand={expandedKeys => setExpandedKeys(expandedKeys)}
            selectedKeys={[ selectedKey ]}
            {...others}
        >
            {treeNodes}
        </Tree>
    );
};

TreeEditor.propTypes = {
    dataSource: PropTypes.array,
    readOnly: PropTypes.bool,
    selectedKey: PropTypes.any,
    onClick: PropTypes.func,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    onSave: PropTypes.func,
};

export default TreeEditor;
