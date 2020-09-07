import React from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import './EditStyle.less';

export default config()(props => {

    return (
        <PageContent styleName="root">
            项目编辑页面
            <div style={{ width: 100, height: 1000, background: 'red' }}/>
        </PageContent>
    );
});
