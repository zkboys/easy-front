import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Table, Tooltip } from 'antd';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import { useGet } from 'src/commons/ajax';
import ApiStatus from 'src/components/api-status';
import ApiMethod from 'src/components/api-method';
import UserLink from 'src/components/user-link';
import Help from 'src/components/help';
import Copy from 'src/components/copy';
import './style-preview.less';

export default config()(props => {
    const { id, projectId } = props;
    const [ api, setApi ] = useState({});

    const [ loading, fetchApi ] = useGet('/projects/:projectId/apis/:id');

    useEffect(() => {
        (async () => {
            const api = await fetchApi({ projectId, id });
            setApi(api);
        })();
    }, [ id ]);

    const mockPath = `${window.location.origin}/mock/${projectId}${api?.project?.apiPrefix || ''}${api.path}`;
    return (
        <PageContent styleName="root">
            <h2 styleName="title">基本信息</h2>
            <div styleName="base-box">
                <div styleName="item">
                    <div styleName="label">接口名称</div>
                    <div styleName="value">{api.name}</div>
                </div>
                <div styleName="item">
                    <div styleName="label">创建人</div>
                    <div styleName="value">
                        <UserLink user={api.user}/>
                    </div>
                </div>
                <div styleName="item">
                    <div styleName="label">状态</div>
                    <div styleName="value"><ApiStatus status={api.status}/></div>
                </div>
                <div styleName="item">
                    <div styleName="label">更新时间</div>
                    <div styleName="value">{moment(api.updatedAt).format('YYYY-MM-DD HH:mm')}</div>
                </div>
                <div styleName="item">
                    <div styleName="label">接口路径</div>
                    <div styleName="value"><ApiMethod method={api.method}/>{api.path}</div>
                </div>
                <div styleName="item"/>
                <div styleName="item all">
                    <div styleName="label">Mock地址</div>
                    <div styleName="value">
                        {mockPath}
                        <Copy text={mockPath}/>
                    </div>
                </div>
            </div>
            <h2 styleName="title">请求参数</h2>
            <h3>headers<Help.HttpParamHeader/></h3>
            <Table
                columns={[
                    { title: '键（key）', dataIndex: 'key' },
                    { title: '值（value）', dataIndex: 'key' },
                ]}
            />
            <h3>path<Help.HttpParamPath/></h3>
            <Table
                columns={[
                    { title: '键（key）', dataIndex: 'key' },
                    { title: '值（value）', dataIndex: 'key' },
                ]}
            />
            <h3>query<Help.HttpParamQuery/></h3>
            <Table
                columns={[
                    { title: '键（key）', dataIndex: 'key' },
                    { title: '值（value）', dataIndex: 'key' },
                ]}
            />
            <h3>body<Help.HttpParamBody/></h3>
            {/* TODO 有可能是多层级 */}
            <Table
                columns={[
                    { title: '键（key）', dataIndex: 'key' },
                    { title: '值（value）', dataIndex: 'key' },
                ]}
            />
            <h2 styleName="title">响应结果（200）</h2>
        </PageContent>
    );
});
