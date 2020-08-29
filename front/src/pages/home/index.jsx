import React, { useEffect } from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import './style.less';

export default config({
    pageHead: false,
    path: '/',
    title: { text: '首页', icon: 'home' },
    breadcrumbs: [ { key: 'home', text: '首页', icon: 'home' } ],
})(props => {
    useEffect(() => {
        props.history.replace('/team/:teamId/:tabId');
    }, []);
    return (
        <PageContent>
        </PageContent>
    );
});
