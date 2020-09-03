import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import config from 'src/commons/config-hoc';
import PageContent from '@/layouts/page-content';
import {
    DeploymentUnitOutlined,
    EyeOutlined,
    FormOutlined,
    BugOutlined,
} from '@ant-design/icons';
import _ from 'lodash';

const { TabPane } = Tabs;

const otherHeight = 168;

export default config()(props => {
    const { height: containerHeight, activeKey = 'preview', onTabChange } = props;
    const [ height, setHeight ] = useState(document.documentElement.clientHeight - otherHeight);

    // 窗口大小改变事件
    const handleWindowResize = _.debounce(() => {
        const windowHeight = document.documentElement.clientHeight;
        const height = windowHeight - otherHeight;
        setHeight(height);
    }, 100);

    // 组件加载完成
    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return (
        <PageContent style={{ margin: 0, padding: 0 }}>
            <div className="pan-content" style={{ height: containerHeight + 50, paddingTop: 0, paddingBottom: 0 }}>
                <Tabs onChange={key => onTabChange && onTabChange(key)} activeKey={activeKey}>
                    <TabPane tab={<span><EyeOutlined/> 预览</span>} key="preview">
                        <div style={{ height, overflowY: 'auto' }}>
                            预览
                            <div style={{ width: 100, height: 1000, background: 'green' }}/>
                        </div>
                    </TabPane>
                    <TabPane tab={<span><FormOutlined/> 编辑</span>} key="edit">
                        编辑
                    </TabPane>
                    <TabPane tab={<span><BugOutlined/> 运行</span>} key="run">
                        运行
                    </TabPane>
                    <TabPane tab={<span><DeploymentUnitOutlined/> mock</span>} key="mock">
                        mock
                    </TabPane>
                </Tabs>
            </div>
        </PageContent>
    );
});
