import React, { useState, useEffect, useCallback } from 'react';
import config from 'src/commons/config-hoc';
import { Tree, Input } from 'antd';
import { convertToTree, renderNode, addNodeChildByKey } from 'src/library/utils/tree-utils';
import { useGet } from '@/commons/ajax';
import PageContent from '@/layouts/page-content';
import { v4 as uuid } from 'uuid';
import MarkDownEditor from 'src/pages/markdown-editor';
import './WikiStyle.less';
import { Icon } from '@/library/components';
import { HomeOutlined } from '@ant-design/icons';
import Link from '@/layouts/page-link';

const { TreeNode } = Tree;

const testContents = [
    { id: 1, title: '简介' },
    { id: 2, title: '快速开始' },
    { id: 3, parentId: 2, title: '安装' },
    { id: 4, parentId: 2, title: '开发' },
];

function getMarkDownContents(contents) {
    const arr = [];

    const loop = (nodes, level = 0) => {
        if (!nodes?.length) return;
        nodes.forEach(node => {
            const { title, id } = node;
            if (!title) return;

            const space = Array.from({ length: level * 4 }).map(() => ' ').join('');
            arr.push(`${space}* [${title}](${id}.md)`);

            const children = nodes.filter(item => item.parentId === id);

            loop(children, level + 1);
        });
    };

    loop(contents);
    return arr;
}

function convertContents(markdown) {
    if (!markdown) return;
    const arr = markdown.split('\n');
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const line = arr[i];
        if (!line || !line.trim()) continue;
        const title = /\[(.*)\]/.exec(line)[1];
        const id = /\((.*)\.md\)/.exec(line)[1];
        const space = /(\s*)/.exec(line)[1];
        const spaceCount = space.length;
        const prev = result[i - 1];
        let parentId;
        if (prev) {
            if (prev.spaceCount === spaceCount) {
                parentId = prev.parentId;
            }
            if (prev.spaceCount < spaceCount) {
                parentId = prev.id;
            }
        }

        result.push({
            id,
            title,
            spaceCount,
            parentId,
        });
    }
    return result;
}

const TOP_HEIGHT = 100;
export default config()(props => {
    const { height, projectId } = props;
    const [ currentContent, setCurrentContent ] = useState(null);
    const [ markdown, setMarkdown ] = useState('');
    const [ contents, setContents ] = useState([]);
    const [ fileName, setFileName ] = useState(null);
    const [ expandedKeys, setExpandedKeys ] = useState([]);
    const [ treeNodes, setTreeNodes ] = useState([]);

    const [ loading, fetchContents ] = useGet('/projects/:projectId/wikiContents');


    function handleMarkdownChange(getValue) {
        const markdown = getValue();
        setMarkdown(markdown);
    }

    const handleMarkdownSave = useCallback(() => {
        console.log('保存', markdown);
    }, [ markdown ]);

    // 目录点击回车事件
    async function handlePressEnter(e, node) {
        const { target: { value }, metaKey, ctrlKey, shiftKey } = e;

        const { id, parentId } = node;

        if (!value) return;

        // 保存当前目录
        if (!metaKey && !ctrlKey && !shiftKey) {

            console.log(node.title);
            console.log('保存目录');

            const markdownContents = getMarkDownContents(contents);
            console.log(markdownContents);

            // 重新获取目录
            await getContents();

            return;
        }

        // 添加节点 按住shift 添加的是子节点
        if (metaKey || ctrlKey) {
            const newId = uuid();
            contents.forEach(item => item.autoFocus = false);
            contents.push({
                id: newId,
                parentId: shiftKey ? id : parentId,
                title: '',
                autoFocus: true,
                isNew: true,
            });

            setContents([ ...contents ]);
        }
    }

    // 目录失去焦点
    function handleBlur(e, node) {
        const { value } = e.target;
        // 如果value不存在 删除node
    }

    // 添加节点
    function handleAddContent(node) {

    }

    async function getContents() {
        let dataSource = await fetchContents(projectId);

        if (!dataSource?.length) dataSource = [];

        const contents = convertContents(dataSource);

        console.log(contents);

        setContents(contents);
    }

    // 获取树
    useEffect(() => {
        contents.forEach(item => {
            const { id, parentId } = item;
            item.key = `${id}`;
            item.parentKey = `${parentId}`;
        });

        const treeData = convertToTree(contents);
        let expandedKeys = [];
        const treeNodes = renderNode(treeData, (item, children) => {
            const {
                key,
                title,
                autoFocus,
            } = item;
            expandedKeys.push(key);

            let nodeTitle = (
                <Input
                    autoFocus={autoFocus}
                    id={`input_${key}`}
                    styleName="content-input"
                    defaultValue={title}
                    onPressEnter={e => handlePressEnter(e, item)}
                    onBlur={e => handleBlur(e, item)}
                    onFocus={() => {
                        setCurrentContent(item);
                        const markdown = item?.markdown || `# ${item?.title || '标题'}`;
                        setMarkdown(markdown);
                    }}
                />
            );

            if (children) {
                return (
                    <TreeNode key={key} title={nodeTitle}>
                        {children}
                    </TreeNode>
                );
            }

            return (
                <TreeNode key={key} title={nodeTitle}/>
            );
        });

        setTreeNodes(treeNodes);
        setExpandedKeys(expandedKeys);
        console.log(expandedKeys);
    }, [ contents ]);

    useEffect(() => {
        (async () => {
            await getContents();
        })();
    }, [ projectId ]);

    return (
        <PageContent styleName="root" loading={loading}>
            <div style={{ height: TOP_HEIGHT }}>
            </div>
            <div styleName="box" style={{ height: height - TOP_HEIGHT }}>
                <div styleName="contents">
                    <Tree
                        selectable={false}
                        defaultExpandAll
                        expandedKeys={expandedKeys}
                    >
                        {treeNodes}
                    </Tree>
                </div>
                <div styleName="content">
                    <MarkDownEditor
                        key={currentContent?.key}
                        defaultValue={markdown}
                        onChange={handleMarkdownChange}
                        onSave={handleMarkdownSave}
                    />
                </div>
            </div>
        </PageContent>
    );
});
