import React, { useEffect, useState, useRef } from 'react';
import { Button, Empty, Tabs } from 'antd';
import config from 'src/commons/config-hoc';
import PageContent from '@/layouts/page-content';
import {
    DeploymentUnitOutlined,
    EyeOutlined,
    FormOutlined,
    BugOutlined, ApiOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import Preview from './Preview';
import Edit from './Edit';
import './indexStyle.less';
import { useGet } from '@/commons/ajax';

const { TabPane } = Tabs;

const otherHeight = 168;

export default config()(props => {
    const {
        height: containerHeight,
        id: apiId,
        projectId,
        activeKey = 'preview',
        onTabChange,
        onCreateApi,
    } = props;

    const [ api, setApi ] = useState(null);
    const previewEl = useRef(null);
    const runEl = useRef(null);
    const mockEl = useRef(null);
    const [ height, setHeight ] = useState(document.documentElement.clientHeight - otherHeight);

    const [ loading, fetchApi ] = useGet('/projects/:projectId/apis/:id');

    // 窗口大小改变事件
    const handleWindowResize = _.debounce(() => {
        const windowHeight = document.documentElement.clientHeight;
        const height = windowHeight - otherHeight;
        setHeight(height);
    }, 100);

    // 滚动条滚动到顶部
    useEffect(() => {
        if (previewEl.current) previewEl.current.scrollTop = 0;
        if (runEl.current) runEl.current.scrollTop = 0;
        if (mockEl.current) mockEl.current.scrollTop = 0;
    }, [ apiId ]);

    // 获取api对象
    useEffect(() => {
        (async () => {
            const api = await fetchApi({ projectId, id: apiId });
            setApi(api);
        })();
    }, [ apiId ]);

    // 组件加载完成
    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    if (!api) return (
        <PageContent style={{ margin: 0, padding: 0 }} loading={loading}>
            <div className="pan-content" style={{ height: containerHeight + 50, paddingLeft: 16 }}>
                <Empty
                    style={{ marginTop: 100 }}
                    description="此接口不存在，或已删除"
                >
                    <Button
                        type="primary"
                        onClick={() => onCreateApi()}
                    >
                        <ApiOutlined/> 创建接口
                    </Button>
                </Empty>
            </div>
        </PageContent>
    );

    return (
        <PageContent style={{ margin: 0, padding: 0 }} loading={loading}>
            <div className="pan-content" style={{ height: containerHeight + 50, paddingLeft: 16 }}>
                <Tabs onChange={key => onTabChange && onTabChange(key)} activeKey={activeKey}>
                    <TabPane tab={<span><EyeOutlined/> 预览</span>} key="preview">
                        <div ref={previewEl} style={{ height, overflowY: 'auto' }}>
                            {activeKey === 'preview' ? (
                                <Preview
                                    id={apiId}
                                    projectId={projectId}
                                />
                            ) : null}
                        </div>
                    </TabPane>
                    <TabPane tab={<span><FormOutlined/> 编辑</span>} key="edit">
                        <div style={{ height, overflowY: 'auto' }}>
                            {activeKey === 'edit' ? (
                                <Edit
                                    id={apiId}
                                    projectId={projectId}
                                    height={height}
                                />
                            ) : null}
                        </div>
                    </TabPane>
                    <TabPane tab={<span><BugOutlined/> 运行</span>} key="run">
                        <div ref={runEl} style={{ height, overflowY: 'auto' }}>
                            运行
                        </div>
                    </TabPane>
                    <TabPane tab={<span><DeploymentUnitOutlined/> mock</span>} key="mock">
                        <div ref={mockEl} style={{ height, overflowY: 'auto' }}>
                            mock
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        </PageContent>
    );
});
