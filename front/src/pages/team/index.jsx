import React, { useEffect, useState } from 'react';
import config from 'src/commons/config-hoc';
import { Tabs } from 'antd';
import _ from 'lodash';


import './style.less';

const { TabPane } = Tabs;
const otherHeight = 126;

export default config({})(props => {
    const [ height, setHeight ] = useState(document.documentElement.clientHeight - otherHeight);

    function handleTabChange() {

    }

    const handleWindowResize = _.debounce(() => {
        const windowHeight = document.documentElement.clientHeight;
        const height = windowHeight - otherHeight;
        console.log(height);
        setHeight(height);
    }, 100);

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return (
        <div styleName="team-root">
            <div styleName="list" style={{ height: height + 44 }}>
                <div styleName="top">
                    团队名字
                </div>
                <div styleName="menu">
                    <div style={{ height: 1000, background: 'yellow', width: 100 }}/>
                </div>
            </div>
            <div styleName="detail">
                <Tabs onChange={handleTabChange} type="card">
                    <TabPane tab="项目列表" key="1">
                        <div styleName="pan-content" style={{ height }}>
                            这里是项目列表
                            <div style={{ height: 1000, background: 'yellow', width: 100 }}/>
                        </div>
                    </TabPane>
                    <TabPane tab="团队成员" key="2">
                        <div styleName="pan-content" style={{ height }}>
                            这里是团队成员
                        </div>
                    </TabPane>
                    <TabPane tab="团队动态" key="3">
                        <div styleName="pan-content" style={{ height }}>
                            这里是团队动态
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
});
