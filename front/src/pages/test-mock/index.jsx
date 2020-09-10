import React, { useState } from 'react';
import { Button } from 'antd';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';

export default config({ path: '/test-mock' })(props => {

    const [ res, setRes ] = useState('');
    const [ err, setErr ] = useState('');

    const prefix = '/mock/10';

    const data = [
        {
            method: 'post',
            url: '/users',
            params: null,
        },
    ];
    return (
        <PageContent>
            {data.map(item => {
                const { method, url, params } = item;
                return (
                    <Button
                        onClick={() => {
                            setRes('');
                            setErr('');
                            props.ajax[method](prefix + url, params, { baseURL: '' })
                                .then(res => {
                                    setRes(JSON.stringify(res, null, 4));
                                })
                                .catch(err => {
                                    setErr(JSON.stringify(err.response.data, null, 4));
                                });
                        }}
                    >
                        {method}:{url}
                    </Button>
                );
            })}

            <pre>
                {res}
            </pre>
            <pre>
                {err}
            </pre>
        </PageContent>
    );
});
