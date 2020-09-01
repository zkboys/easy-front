import React, { useState, useEffect } from 'react';
import { Empty, Timeline, Button } from 'antd';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { UserAvatar } from 'src/library/components';
import config from 'src/commons/config-hoc';
import { useGet } from 'src/commons/ajax';
import PageContent from 'src/layouts/page-content';
import RoleTag from '../role-tag';
import './style.less';

function getContent(data) {
    const { type, id, name, role } = data;
    if (type === 'userLink') return <Link to={`/users/${id}`}>{name}</Link>;
    if (type === 'teamLink') return <Link to={`/teams/${id}/project`}>{name}</Link>;
    if (type === 'roleTag') return <RoleTag role={role}/>;
}

function getDetail(detail) {
    if (!detail) return;
    return detail.split('\n').map(item => {

        if (item.includes('<<->>') && item.includes('-->>')) return changeLog(item);

        return <div>{item}</div>;
    });
}

function changeLog(str) {
    const strArr = str.split('<<->>');
    const label = strArr[0];
    const content = strArr[1];
    let prev = '';
    let next = '';
    if (content) {
        [ prev, next ] = content.split('-->>');
    }

    return (
        <div>
            <div styleName="label">{label}{label ? '：' : ''}</div>
            <div styleName="prev">{prev}</div>
            <div styleName="next">{next}</div>
        </div>
    );
}

export default config()(props => {
    const { url, pageSize = 10, team } = props;
    const [ pageNum, setPageNum ] = useState(1);
    const [ dataSource, setDataSource ] = useState([]);
    const [ noMore, setNoMore ] = useState(false);
    const [ showDetail, setShowDetail ] = useState({});

    const [ loading, fetchDataSource ] = useGet(url);

    function handleToggleDetail(id) {
        showDetail[id] = !showDetail[id];
        setShowDetail({ ...showDetail });
    }

    // url 改变，查询新的内容
    useEffect(() => {
        setPageNum(1);
    }, [ url, team ]);

    useEffect(() => {
        (async () => {
            const { rows = [] } = await fetchDataSource({ pageNum, pageSize });

            setNoMore(!rows || rows.length < pageSize);

            if (pageNum === 1) {
                setDataSource(rows);
            } else {
                setDataSource([ ...dataSource, ...rows ]);
            }
        })();
    }, [ pageNum, url, team ]);

    return (
        <PageContent styleName="root" loading={loading}>
            {dataSource?.length ? (
                <>
                    <Timeline pending={loading ? '加载中。。。' : ''}>
                        {dataSource.map(item => {
                            let { id, title, user = {}, summary, createdAt, detail } = item;
                            if (!user) return '';

                            const detailIsShown = showDetail[id];

                            let summaryJsx = [];
                            const jsons = summary.match(/{(?:(?!})[\s\S])*}/gi);
                            if (jsons) {
                                jsons.forEach(str => {
                                    const data = JSON.parse(str);
                                    const content = getContent(data);
                                    const summarys = summary.split(str);
                                    summary = summarys.pop();

                                    summarys.forEach(t => {
                                        summaryJsx.push(t);
                                        summaryJsx.push(content);
                                    });
                                });
                            } else {
                                summaryJsx.push(summary);
                            }

                            return (
                                <Timeline.Item
                                    dot={(
                                        <div styleName="dot">
                                            <div styleName="time">{moment(createdAt).fromNow()}</div>
                                            <UserAvatar src={user.avatar} name={user.name}/>
                                        </div>
                                    )}
                                >
                                    <div styleName="box">
                                        <div styleName="real-time">
                                            <div styleName="title">{title}</div>
                                            {moment(createdAt).format('YYYY年MM月DD日 HH:mm')}
                                        </div>
                                        <div styleName="summary">
                                            <Link to={`/users/${user.id}`}>{user.name}</Link>
                                            {summaryJsx}
                                            {detail ? (
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    ghost
                                                    styleName="detail-extend"
                                                    onClick={() => handleToggleDetail(id)}
                                                >
                                                    {detailIsShown ? '收起详情' : '显示详情'}
                                                </Button>
                                            ) : null}
                                            <div styleName="detail" style={{ display: detailIsShown ? 'block' : 'none' }}>
                                                {getDetail(detail)}
                                            </div>
                                        </div>

                                    </div>
                                </Timeline.Item>
                            );
                        })}
                    </Timeline>
                    <div styleName="more">
                        {noMore ? (
                            <div>没有跟多了</div>
                        ) : (
                            <Button
                                type="primary"
                                onClick={() => setPageNum(pageNum + 1)}
                            >
                                加载更多
                            </Button>
                        )}
                    </div>
                </>
            ) : (
                <Empty
                    styleName="empty"
                    description={'暂无动态'}
                />
            )}
        </PageContent>
    );
});
