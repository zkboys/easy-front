import React, { useState, useEffect, useRef } from 'react';
import config from 'src/commons/config-hoc';
import { Tree, Input } from 'antd';
import { useGet, usePost } from '@/commons/ajax';
import PageContent from '@/layouts/page-content';
import { v4 as uuid } from 'uuid';
import MarkDownEditor from 'src/pages/markdown-editor';
import './WikiStyle.less';

const { TreeNode } = Tree;

function getMarkDownContents(contents) {
    const arr = [];

    if (!contents?.length) return '';

    const loop = (nodes, level = 0) => {
        if (!nodes?.length) return;
        nodes.forEach(node => {
            const { title, id } = node;
            if (!title) return;

            const space = Array.from({ length: level * 4 }).map(() => ' ').join('');
            arr.push({
                content: `${space}* [${title}](${id}.md)`,
                id,
                title,
                spaceCount: level * 4,
            });

            const children = contents.filter(item => item.parentId === id);

            loop(children, level + 1);
        });
    };

    loop(contents.filter(item => !item.parentKey));
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
    const [ blurToSave, setBlurToSave ] = useState(false);
    const [ expandedKeys, setExpandedKeys ] = useState([]);
    const contentEl = useRef(null);
    const markdownValue = useRef({});

    const [ loading, fetchContents ] = useGet('/projects/:projectId/wikiContents');
    const [ saving, saveContents ] = usePost('/projects/:projectId/wikiContents', { successTip: '目录保存成功！' });
    const [ articleLoading, fetchArticle ] = useGet('/projects/:projectId/wiki/:id');
    const [ articleSaving, saveArticle ] = usePost('/projects/:projectId/wiki/:id', { successTip: '文章保存成功！' });

    function handleMarkdownChange(getValue) {
        const markdown = getValue();
        setMarkdown(markdown);
        markdownValue.current.markdown = markdown;
    }

    // window获取不到 markdown 需要用ref方式保存
    async function handleWindowSave(e) {
        const { keyCode, ctrlKey, metaKey } = e;
        const isS = keyCode === 83;

        if ((ctrlKey || metaKey) && isS) {
            e.preventDefault();

            if (!markdownValue?.current?.markdown) return;
            await saveArticle({ projectId, id: markdownValue.current.currentContent.key, article: markdownValue.current.markdown });
        }
    }

    async function handleSaveContent(nodes) {
        const conts = nodes || contents;
        const markdownContents = getMarkDownContents(conts);
        await saveContents({ projectId, contents: markdownContents });
        // 重新获取目录
        await getContents();
        setBlurToSave(false);
    }

    // 目录点击回车事件
    async function handlePressEnter(e, node) {
        const { target: { value }, metaKey, ctrlKey, shiftKey } = e;

        const { id, parentId } = node;

        node.title = value;

        if (!value) return;

        // 保存当前目录
        if (!metaKey && !ctrlKey && !shiftKey) {
            await handleSaveContent();
            await handleClick(e, node);
            return;
        }

        // 添加节点 按住shift 添加的是子节点
        if (metaKey || ctrlKey) {
            const newId = uuid();
            contents.forEach(item => item.autoFocus = false);
            contents.push({
                id: newId,
                parentId: shiftKey ? id : parentId,
                title: '新建文档',
                autoFocus: true,
                isNew: true,
            });

            // 添加子级的时候，展开父级节点
            if (shiftKey && !expandedKeys.includes(id)) {
                setExpandedKeys([ ...expandedKeys, id ]);
            }

            await handleSaveContent(contents);

            setContents([ ...contents ]);
        }
    }

    // 目录失去焦点
    async function handleBlur(e, node) {
        const { value } = e.target;
        if (!value) {
            const nodes = contents.filter(item => item.key !== node.key);
            setContents(nodes);
        }

        if (blurToSave) {
            node.title = value;
            // 保存目录
            await handleSaveContent();
        }
    }

    // 目录获取焦点
    async function handleClick(e, node) {
        const markdown = await fetchArticle({ projectId, id: node.key });
        setMarkdown(markdown);
        setCurrentContent(node);

        markdownValue.current.markdown = markdown;
        markdownValue.current.currentContent = node;
    }

    async function getContents() {
        let dataSource = await fetchContents(projectId);

        if (!dataSource?.length) dataSource = [];

        const contents = convertContents(dataSource);

        setContents(contents);
        return contents;
    }

    useEffect(() => {
        (async () => {
            const contents = await getContents();
            if (contents?.length) {
                await handleClick(null, contents[0]);
            }
        })();
    }, [ projectId ]);

    let treeNodes = null;
    if (contents?.length) {
        contents.forEach(item => {
            const { id, parentId } = item;
            item.key = `${id}`;
            item.parentKey = parentId ? `${parentId}` : undefined;
        });

        const loop = nodes => {
            return nodes.map(node => {
                const {
                    key,
                    title,
                    autoFocus,
                } = node;
                const children = contents.filter(item => item.parentKey === key);
                const active = currentContent?.key === key;


                let nodeTitle = (
                    <Input
                        autoFocus={autoFocus}
                        id={`input_${key}`}
                        styleName={`content-input ${active ? 'active' : ''}`}
                        defaultValue={title}
                        onPressEnter={e => handlePressEnter(e, node)}
                        onChange={() => setBlurToSave(true)}
                        onBlur={e => handleBlur(e, node)}
                        onClick={e => handleClick(e, node)}
                        onFocus={e => handleClick(e, node)}
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

        treeNodes = loop(contents.filter(item => !item.parentKey));
    }

    useEffect(() => {
        window.addEventListener('keydown', handleWindowSave);

        return () => {
            window.removeEventListener('keydown', handleWindowSave);
        };
    }, []);

    return (
        <PageContent styleName="root" loading={loading || saving || articleLoading || articleSaving}>
            <div style={{ height: TOP_HEIGHT }}>
            </div>
            <div styleName="box" style={{ height: height - TOP_HEIGHT }}>
                <div styleName="contents" ref={contentEl}>
                    <Tree
                        selectable={false}
                        defaultExpandAll
                        expandedKeys={expandedKeys}
                        onExpand={expandedKeys => setExpandedKeys(expandedKeys)}
                    >
                        {treeNodes}
                    </Tree>
                </div>
                <div styleName="content" key={currentContent?.key}>
                    <MarkDownEditor
                        defaultValue={markdown}
                        onChange={handleMarkdownChange}
                    />
                </div>
            </div>
        </PageContent>
    );
});
