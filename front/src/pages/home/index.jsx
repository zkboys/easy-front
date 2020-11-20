import React, { useEffect, useState } from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import UserInfo from './UserInfo';
import UserTeam from './UserTeam';
import './style.less';

export default config({
    pageHead: false,
    path: '/',
    title: { text: '工作台', icon: 'home' },
    breadcrumbs: [ { key: 'home', text: '首页', icon: 'home' } ],
})(props => {
    useEffect(() => {
    }, []);
    return (
        <PageContent styleName="root">
            <UserInfo/>
            <UserTeam/>
        </PageContent>
    );
});
