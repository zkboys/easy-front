import React, { useState, useEffect, useRef } from 'react';
import config from 'src/commons/config-hoc';
import { Modal, Switch } from 'antd';
import { useGet, usePost } from '@/commons/ajax';
import PageContent from '@/layouts/page-content';
import MarkDownEditor from 'src/pages/markdown-editor';
import FullScreen from 'src/layouts/header/header-full-screen';
import './WikiStyle.less';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TreeEditor from '@/components/tree-editor';

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

    async function handleSaveContent() {
        const markdownContents = getMarkDownContents(contents);
        await saveContents({ projectId, contents: markdownContents });
        // 重新获取目录
        await getContents();
    }

    async function handleDeleteContent(keys) {
        await deleteContents({ projectId, keys });
        await getContents();
    }

    // 目录点击
    async function handleClick(e, node) {
        if (node?.key === currentContent?.key) return;

        const markdown = await fetchArticle({ projectId, id: node.key });
        setMarkdown(markdown);
        setCurrentContent(node);
    }

    // 添加目录
    async function handleAdd(e, parentKey) {
        const newId = `article_${Date.now()}`;
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

        await handleSaveContent(contents);

        await handleClick(null, newNode);
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
                    <TreeEditor
                        dataSource={contents}
                        readOnly={readOnly || innerReadOnly}
                        selectedKey={currentContent?.key}
                        onClick={handleClick}
                        onAdd={handleAdd}
                        onDelete={handleDeleteContent}
                        onSave={handleSaveContent}
                    />
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
