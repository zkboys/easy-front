import React, { useState, useEffect, useRef } from 'react';
import config from 'src/commons/config-hoc';
import { Tree, Input, Modal, Switch } from 'antd';
import { useGet, usePost } from '@/commons/ajax';
import PageContent from '@/layouts/page-content';
import MarkDownEditor from 'src/pages/markdown-editor';
import confirm from 'src/components/confirm';
import FullScreen from 'src/layouts/header/header-full-screen';
import './WikiStyle.less';
import { QuestionCircleOutlined } from '@ant-design/icons';

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
            key: `${id}`,
            parentKey: parentId ? `${parentId}` : undefined,
        });
    }

    return result;
}

export default config({ router: true, query: true })(props => {
    const { height, projectId, readOnly } = props;
    const [ currentContent, setCurrentContent ] = useState(null);
    const [ markdown, setMarkdown ] = useState('');
    const [ contents, setContents ] = useState([]);
    const [ blurToSave, setBlurToSave ] = useState(false);
    const [ expandedKeys, setExpandedKeys ] = useState([]);
    const [ innerReadOnly, setInnerReadOnly ] = useState(false);
    const boxEl = useRef(null);
    const saveIt = useRef(0);

    const [ loading, fetchContents ] = useGet('/projects/:projectId/wikiContents');
    const [ saving, saveContents ] = usePost('/projects/:projectId/wikiContents', { successTip: '目录保存成功！' });
    const [ deleting, deleteContents ] = usePost('/projects/:projectId/wikiContents/delete', { successTip: '删除成功！' });
    const [ articleLoading, fetchArticle ] = useGet('/projects/:projectId/wiki/:id');
    const [ articleSaving, saveArticle ] = usePost('/projects/:projectId/wiki/:id', { successTip: '文章保存成功！' });

    function formatMarkdown(markdown) {
        if (markdown) {
            return markdown.split('\n').filter(item => item.trim() !== '\\').join('\n');
        }
        return markdown;
    }


    function handleMarkdownChange(getValue) {
        const markdown = getValue();
        setMarkdown(markdown);
        if (saveIt.current) {
            window.clearTimeout(saveIt.current);
        }

        saveIt.current = window.setTimeout(async () => {
            const article = formatMarkdown(markdown);
            await saveArticle({ projectId, id: currentContent?.key, article }, { successTip: false, errorTip: false, withLoading: false });
        }, 300);
    }

    // window获取不到 markdown 需要用ref方式保存
    async function handleWindowSave(e) {
        if (!markdown) return;

        const { keyCode, ctrlKey, metaKey } = e;
        const isS = keyCode === 83;

        if ((ctrlKey || metaKey) && isS) {
            e.preventDefault();

            const article = formatMarkdown(markdown);
            await saveArticle({ projectId, id: currentContent?.key, article });
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

    async function handleDeleteContent(node) {
        if (contents?.length === 1) {
            return Modal.info({
                title: '提示',
                content: '必须保留一篇文章！',
            });
        }
        await confirm({
            title: '提示',
            content: `您确定删除「${node.title}」?如果存在子级，也全部删除，请谨慎操作！`,
        });

        const nodes = [];
        const loop = node => {
            nodes.push(node);
            const children = contents.filter(item => item.parentKey === node.key);
            if (children?.length) {
                children.forEach(item => loop(item));
            }
        };

        loop(node);

        const keys = nodes.map(item => item.key);

        await deleteContents({ projectId, keys });

        const cs = await getContents();
        if (cs?.length) {
            // 选中
            const children = contents.filter(item => item.parentKey === node.parentKey);
            let selectedNode = cs[0];

            if (children?.length === 1) {
                if (node.parentKey) {
                    selectedNode = cs.find(item => item.key === node.parentKey);
                } else {
                    selectedNode = cs[0];
                }
            }

            if (children?.length > 1) {
                const deletedIndex = contents.findIndex(item => item.key === node.key);
                if (deletedIndex === children.length - 1) {
                    selectedNode = cs[deletedIndex - 1];
                } else {
                    selectedNode = cs[deletedIndex];
                }
            }

            await handleClick(null, selectedNode);
        }
    }

    // 目录点击回车事件
    async function handleKeyDown(e, node) {
        const { target: { value }, keyCode, metaKey, ctrlKey, shiftKey } = e;
        const isEnter = keyCode === 13;
        const isDelete = keyCode === 46;
        const { id, parentId } = node;

        if ((metaKey || ctrlKey) && isDelete) {
            // 删除
            await handleDeleteContent(node);
            return;
        }

        if (isEnter) {
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
                const newId = `article_${Date.now()}`;
                const parentKey = shiftKey ? id : parentId;
                contents.forEach(item => item.autoFocus = false);
                const newNode = {
                    id: newId,
                    parentId: parentKey,
                    key: newId,
                    parentKey,
                    title: '新建文档',
                    autoFocus: true,
                    isNew: true,
                };

                contents.push(newNode);

                // 添加子级的时候，展开父级节点
                if (shiftKey && !expandedKeys.includes(id)) {
                    setExpandedKeys([ ...expandedKeys, id ]);
                }

                await handleSaveContent(contents);

                setContents([ ...contents ]);

                await handleClick(null, newNode);
            }
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
        if (node?.key === currentContent?.key) return;

        const markdown = await fetchArticle({ projectId, id: node.key });
        setMarkdown(markdown);
        setCurrentContent(node);
    }

    async function getContents() {
        let dataSource = await fetchContents(projectId);

        if (!dataSource?.length) dataSource = '';

        const contents = convertContents(dataSource);

        setContents(contents);
        return contents;
    }

    useEffect(() => {
        (async () => {
            const contents = await getContents();
            if (contents?.length) {
                const { key } = props.query;
                let selectedNode = contents[0];

                if (key) {
                    const c = contents.find(item => item.key === `${key}`);
                    if (c) selectedNode = c;
                }

                await handleClick(null, selectedNode);
            }
        })();
    }, [ projectId ]);

    let treeNodes = null;
    if (contents?.length) {
        const loop = nodes => {
            return nodes.map(node => {
                const {
                    key,
                    title,
                    autoFocus,
                } = node;
                const children = contents.filter(item => item.parentKey === key);
                const active = currentContent?.key === key;

                let nodeTitle = (readOnly || innerReadOnly) ? (
                    <span onClick={e => handleClick(e, node)}>{title}</span>
                ) : (
                    <Input
                        autoFocus={autoFocus}
                        id={`input_${key}`}
                        styleName={`content-input ${active ? 'active' : ''}`}
                        defaultValue={title}
                        onKeyDown={e => handleKeyDown(e, node)}
                        onChange={() => setBlurToSave(true)}
                        onBlur={e => handleBlur(e, node)}
                        onClick={e => handleClick(e, node)}
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
    }, [ currentContent, markdown ]);

    useEffect(() => {
        props.history.replace(`/projects/${projectId}/wiki?key=${currentContent?.key}`);
        window.clearTimeout(saveIt.current);
    }, [ currentContent ]);

    const TOP_HEIGHT = 50;

    console.log(readOnly);
    return (
        <PageContent styleName="root" loading={loading || saving || articleLoading || articleSaving || deleting}>
            <div styleName="top" style={{ height: TOP_HEIGHT }}>
                <div styleName="tip">
                </div>
                {readOnly ? null : (
                    <>
                        <Switch
                            checkedChildren="编辑"
                            unCheckedChildren="只读"
                            checked={innerReadOnly}
                            onChange={value => setInnerReadOnly(value)}
                        />
                        <div styleName="help">
                            <QuestionCircleOutlined onClick={() => {
                                Modal.info({
                                    title: '提示',
                                    width: 510,
                                    content: (
                                        <ol>
                                            <li>目录或文章直接点击即可编辑；</li>
                                            <li>新增同级目录：目录获取焦点后 Ctrl(或 Command) + Enter；</li>
                                            <li>新增子级目录：目录获取焦点后 Ctrl(或 Command) + Shift + Enter；</li>
                                            <li>删除目录：目录获取焦点后 Ctrl(或 Command) + Delete；</li>
                                            <li>保存目录：目录失去焦点 或 点击Enter会触发目录保存；</li>
                                            <li>文章手动保存：Ctrl(或 Command) + S；</li>
                                            <li>文章自动保存：文章改变后会自动保存到服务器；</li>
                                        </ol>
                                    ),
                                });
                            }}/>
                        </div>
                    </>
                )}
                <div styleName="full-screen">
                    <FullScreen element={boxEl.current}/>
                </div>
            </div>
            <div styleName="box" ref={boxEl} style={{ height: height - TOP_HEIGHT }}>
                <div styleName="contents">
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
                        readOnly={readOnly || innerReadOnly}
                        uploadUrl={`/projects/${projectId}/upload/${currentContent?.key}`}
                        defaultValue={markdown}
                        onChange={handleMarkdownChange}
                    />
                </div>
            </div>
        </PageContent>
    );
});
