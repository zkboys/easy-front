import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import config from 'src/commons/config-hoc';
import { Tabs } from 'antd';
import _ from 'lodash';
import PageContent from 'src/layouts/page-content';

import './style.less';

const otherHeight = 176;

const TabPage = config({
    pageHead: false,
    connect: true,
})(props => {
    const {
        loading,
        onChange,
        activeKey,
        detail,
        detailStyle,
        list,
    } = props;

    const [ height, setHeight ] = useState(document.documentElement.clientHeight - otherHeight);
    const tabWrap = useRef();

    // 窗口大小改变事件
    const handleWindowResize = _.debounce(() => {
        const windowHeight = document.documentElement.clientHeight;
        const height = windowHeight - otherHeight;
        setHeight(height);
    }, 100);


    // height activeKey 改变，处理pan-content 高度
    useEffect(() => {
        const tab = tabWrap.current.querySelector('.ant-tabs-tabpane-active');
        if (!tab) return;

        const operator = tab.querySelector('.pan-operator');
        const content = tab.querySelector('.pan-content');

        content.style.height = operator ? `${height}px` : `${height + 50}px`;
    }, [ height, activeKey ]);

    // 组件加载完成
    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('resize', handleWindowResize);

            document.body.style.overflow = prevOverflow;
        };
    }, []);

    return (
        <PageContent
            styleName="root"
            loading={loading}
        >
            <div styleName="root-wrap">
                <div styleName="detail-wrap" style={{ height: height + 94 }}>
                    <div styleName="top" style={detailStyle}>
                        {detail}
                    </div>
                    <div styleName="list">
                        {list}
                    </div>
                </div>
                <div styleName="tabs-wrap" ref={tabWrap}>
                    <Tabs onChange={key => onChange(key)} activeKey={activeKey} type="card">
                        {props.children}
                    </Tabs>
                </div>
            </div>
        </PageContent>
    );
});

TabPage.propTypes = {
    loading: PropTypes.bool,
    onChange: PropTypes.func,
    activeKey: PropTypes.string,
    detail: PropTypes.any,
    detailStyle: PropTypes.object,
    list: PropTypes.any,
};

export default TabPage;
