import React from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';

export default config({ path: '/test-page' })(props => {

    return (
        <PageContent fitHeight>
            <div style={{ width: 100, height: '100%', background: 'green' }}>
                测试页面
            </div>
        </PageContent>
    );
});
