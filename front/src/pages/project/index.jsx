import React from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';

import './style.less';

export default config({
    pageHead: false,
    path: '/projects/:projectId/:tabId',
    connect: true,
})(props => {

    return (
        <PageContent>
        </PageContent>
    );
});
