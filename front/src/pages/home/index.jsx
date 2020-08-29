import React from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import Team from 'src/pages/team';
import './style.less';

export default config({
    pageHead: false,
    path: '/',
    title: { text: '首页', icon: 'home' },
    breadcrumbs: [ { key: 'home', text: '首页', icon: 'home' } ],
})(props => {
    return (
        <PageContent styleName="root">
            <Team/>
        </PageContent>
    );
});
