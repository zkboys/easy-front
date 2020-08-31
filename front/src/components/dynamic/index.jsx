import React, { useState, useEffect } from 'react';
import config from 'src/commons/config-hoc';
import { useGet } from 'src/commons/ajax';
import PageContent from 'src/layouts/page-content';
import { Button, Empty } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import './style.less';

export default config()(props => {
    const { url, pageSize = 10, id, active } = props;
    const [ pageNum, setPageNum ] = useState(1);
    const [ dataSource, setDataSource ] = useState([]);
    const [ noMore, setNoMore ] = useState(false);

    const [ loading, fetchDataSource ] = useGet(url);


    useEffect(() => {
        if (!active) return;
        (async () => {
            const { rows } = await fetchDataSource();

            if (!rows || rows.length < pageSize) {
                setNoMore(true);
            }

            setDataSource([ ...dataSource, ...rows ]);
        })();
    }, [ pageNum ]);

    useEffect(() => {
        if (!active) return;
        (async () => {
            setPageNum(1);
            const { rows } = await fetchDataSource();

            setNoMore(!rows || rows.length < pageSize);
            setDataSource(rows);
        })();
    }, [ id ]);

    console.log(dataSource);
    return (
        <PageContent styleName="root" loading={loading}>
            {dataSource?.length ? dataSource.map(item => {
                const { user = {}, title, createdAt } = item;
                if (!user) return;

                const time = createdAt;
                return (
                    <div>
                        <div styleName="time">{time}</div>
                        <div styleName="avatar">{user.avatar}</div>
                        <div styleName="box">

                        </div>
                    </div>
                );
            }) : (
                <Empty
                    styleName="empty"
                    description={'暂无动态'}
                />
            )}
        </PageContent>
    );
});
