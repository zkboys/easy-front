import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Table } from 'antd';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import { useGet } from 'src/commons/ajax';
import ApiStatus from 'src/components/api-status';
import ApiMethod from 'src/components/api-method';
import UserLink from 'src/components/user-link';
import Help from 'src/components/help';
import Copy from 'src/components/copy';
import YesNoTag from 'src/components/yes-no-tag';
import ValueType from '@/components/value-type';
import BlockTitle from '@/components/block-title';
import './PreviewStyle.less';

export default config()(props => {
    const { id, projectId } = props;
    const [ api, setApi ] = useState({});
    const [ headerParams, setHeaderParams ] = useState([]);
    const [ pathParams, setPathParams ] = useState([]);
    const [ queryParams, setQueryParams ] = useState([]);
    const [ bodyParams, setBodyParams ] = useState([]);

    const [ loading, fetchApi ] = useGet('/projects/:projectId/apis/:id');

    useEffect(() => {
        (async () => {
            const api = await fetchApi({ projectId, id });
            const { params } = api;
            const headerParams = params.filter(item => item.type === 'header');
            const pathParams = params.filter(item => item.type === 'path');
            const queryParams = params.filter(item => item.type === 'query');
            const bodyParams = params.filter(item => item.type === 'body');
            setApi(api);
            setHeaderParams(headerParams);
            setPathParams(pathParams);
            setQueryParams(queryParams);
            setBodyParams(bodyParams);
        })();
    }, [ id ]);

    const paramColumns = [
        { title: '字段名', dataIndex: 'key', width: 150 },
        { title: '类型', dataIndex: 'valueType', width: 100, render: value => <ValueType type={value}/> },
        { title: '必填', dataIndex: 'required', width: 100, render: value => <YesNoTag value={value}/> },
        // { title: '默认值', dataIndex: 'defaultValue', width: 150, render: value => value || '-' },
        { title: '描述', dataIndex: 'description', render: value => value || '-' },
    ];
    const mockPath = `${window.location.origin}/mock/${projectId}${api?.project?.apiPrefix || ''}${api.path}`;
    return (
        <PageContent styleName="root">
            <BlockTitle>基本信息</BlockTitle>
            <div styleName="base-box">
                <div styleName="item">
                    <div styleName="label">接口名称</div>
                    <div styleName="value">{api.name}</div>
                </div>
                <div styleName="item">
                    <div styleName="label">创建用户</div>
                    <div styleName="value">
                        <UserLink user={api.user}/>
                    </div>
                </div>
                <div styleName="item">
                    <div styleName="label">后端状态</div>
                    <div styleName="value"><ApiStatus status={api.status}/></div>
                </div>
                <div styleName="item">
                    <div styleName="label">更新时间</div>
                    <div styleName="value">{moment(api.updatedAt).format('YYYY-MM-DD HH:mm')}</div>
                </div>
                <div styleName="item">
                    <div styleName="label">接口路径</div>
                    <div styleName="value">
                        <ApiMethod method={api.method}/>
                        {api.path}
                        <Copy text={api.path}/>
                    </div>
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
            <BlockTitle>请求参数</BlockTitle>
            {!headerParams?.length && !pathParams?.length && !queryParams?.length && !bodyParams?.length ? (
                <span>此接口不需要传递任何参数</span>
            ) : null}
            {headerParams?.length ? (
                <div styleName="params-box">
                    <h3>请求头（headers）<Help type="paramHeader"/></h3>
                    <Table
                        columns={[
                            { title: '字段名', dataIndex: 'key', width: 150 },
                            { title: '参数值', dataIndex: 'value', width: 200 },
                            { title: '必填', dataIndex: 'required', width: 100, render: value => <YesNoTag value={value}/> },
                            { title: '描述', dataIndex: 'description' },
                        ]}
                        dataSource={headerParams}
                        pagination={false}
                    />
                </div>
            ) : null}
            {pathParams?.length ? (
                <div styleName="params-box">
                    <h3>地址参数（path）<Help type="paramPath"/></h3>
                    <Table
                        columns={paramColumns}
                        dataSource={pathParams}
                        pagination={false}
                    />
                </div>
            ) : null}
            {queryParams?.length ? (
                <div styleName="params-box">
                    <h3>查询字符串（query）<Help type="paramQuery"/></h3>
                    <Table
                        columns={paramColumns}
                        dataSource={queryParams}
                        pagination={false}
                    />
                </div>
            ) : null}
            {bodyParams?.length ? (
                <div styleName="params-box">
                    <h3>请求体（body）<Help type="paramBody"/></h3>
                    {/* TODO 有可能是多层级 */}
                    <Table
                        columns={paramColumns}
                        dataSource={bodyParams}
                        pagination={false}
                    />
                </div>
            ) : null}

            <BlockTitle>响应结果（200）</BlockTitle>
        </PageContent>
    );
});
