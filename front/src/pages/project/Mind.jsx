import React, { useState, useRef, useEffect } from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import './MindStyle.less';
import FullScreen from '@/layouts/header/header-full-screen';
import TreeEditor from '@/components/tree-editor';
import { useGet, usePost } from '@/commons/ajax';

const PUBLIC_URL = process.env.PUBLIC_URL;

export default config({ router: true, query: true })(props => {
    const { projectId, height, readOnly } = props;

    const rightEl = useRef(null);
    const [ frameHeight, setFrameHeight ] = useState(height - 8);
    const [ currentContent, setCurrentContent ] = useState({});

    const [ frameReady, setFrameReady ] = useState(false);
    const [ isFull, setIsFull ] = useState(false);
    const [ contents, setContents ] = useState([]);

    const [ loading, fetchContents ] = useGet('/projects/:projectId/mindContents');
    const [ saving, saveContents ] = usePost('/projects/:projectId/mindContents', { successTip: '目录保存成功！' });
    const [ deleting, deleteContents ] = usePost('/projects/:projectId/mindContents/delete', { successTip: '删除成功！' });

    async function getContents() {
        let dataSource = await fetchContents(projectId);

        if (!dataSource?.length) dataSource = [];

        dataSource.forEach(item => {
            item.key = `${item.id}`;
            item.parentKey = item.parentId ? `${item.parentId}` : undefined;
        });

        setContents(dataSource);
        return dataSource;
    }

    async function handleClickContent(e, node) {
        if (node?.key === currentContent?.key) return;
        setCurrentContent(node);

        setTimeout(() => {
            const id = `input_${node?.key}`;
            const input = document.getElementById(id);
            if (input) input.focus();
        }, 300);
    }

    // 添加目录
    async function handleAddContent(e, parentKey) {
        contents.forEach(item => item.autoFocus = false);
        const newId = `id_${Date.now()}`;
        const newNode = {
            id: newId,
            key: newId,
            parentId: parentKey,
            parentKey,
            title: '新建脑图',
            autoFocus: true,
            isNew: true,
        };

        const savedNode = await handleSaveContent(null, newNode);
        savedNode.key = `${savedNode.id}`;
        savedNode.parentKey = `${savedNode.parentId}`;
        await handleClickContent(null, savedNode);
    }

    async function handleDeleteContent(keys) {
        await deleteContents({ projectId, keys });
        await getContents();
    }

    async function handleSaveContent(e, node) {
        const savedNode = await saveContents({ projectId, content: node });
        // 重新获取目录
        await getContents();

        return savedNode;
    }

    useEffect(() => {
        setFrameHeight(isFull ? '100%' : height - 8);
    }, [ height, isFull ]);

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

                await handleClickContent(null, selectedNode);
            }
        })();
    }, [ projectId ]);

    useEffect(() => {
        props.history.replace(`/projects/${projectId}/mind?key=${currentContent?.key}`);
    }, [ currentContent ]);

    useEffect(() => {
        // 等待iframe渲染完成
        setTimeout(() => {
            const frameWindow = document.getElementById('mindIFrame').contentWindow;
            setFrameReady(!!frameWindow.init);

            if (!frameWindow.init) {
                frameWindow.addEventListener('load', () => {
                    setFrameReady(!!frameWindow.init);
                });
                return;
            }

            frameWindow.init(currentContent?.key);
        });
    }, [ frameReady, currentContent, isFull ]);

    return (
        <PageContent styleName="root">
            <div styleName="wrap" ref={rightEl}>
                <div styleName="left" style={{ height: frameHeight }}>
                    <div styleName="tool">
                        <div>
                            目录
                        </div>
                        <FullScreen
                            inFrame
                            element={rightEl.current}
                            onFull={() => setIsFull(true)}
                            onExit={() => setIsFull(false)}
                        />
                    </div>
                    <div styleName="contents">
                        <TreeEditor
                            dataSource={contents}
                            readOnly={readOnly}
                            selectedKey={currentContent?.key}
                            onClick={handleClickContent}
                            onAdd={handleAddContent}
                            onDelete={handleDeleteContent}
                            onSave={handleSaveContent}
                        />
                    </div>
                </div>
                <div styleName="right">
                    <iframe
                        id="mindIFrame"
                        title="脑图"
                        width="100%"
                        height={frameHeight}
                        src={`${PUBLIC_URL}/kityminder-editor/dist/index.html?${isFull}`}
                        frameBorder="0"
                    />
                </div>
            </div>
        </PageContent>
    );
});
