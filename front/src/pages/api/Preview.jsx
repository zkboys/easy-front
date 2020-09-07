import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Table, Row, Col } from 'antd';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import { useGet } from 'src/commons/ajax';
import ApiStatus from 'src/components/api-status';
import ApiMethod from 'src/components/api-method';
import UserLink from 'src/components/user-link';
import Help from 'src/components/help';
import Copy from 'src/components/copy';
import YesNoTag from 'src/components/yes-no-tag';
import ValueType from 'src/components/value-type';
import BlockTitle from 'src/components/block-title';
import './PreviewStyle.less';
import { convertToTree } from '@/library/utils/tree-utils';

export default config()(props => {
    const { id, projectId } = props;
    const [ api, setApi ] = useState({});
    const [ headerParams, setHeaderParams ] = useState([]);
    const [ pathParams, setPathParams ] = useState([]);
    const [ queryParams, setQueryParams ] = useState([]);
    const [ bodyParams, setBodyParams ] = useState([]);
    const [ responseHeaderParams, setResponseHeaderParams ] = useState([]);
    const [ responseBodyParams, setResponseBodyParams ] = useState([]);
    const [ responseBodyRawParams, setResponseBodyRawParams ] = useState([]);

    const [ loading, fetchApi ] = useGet('/projects/:projectId/apis/:id');

    useEffect(() => {
        (async () => {
            const api = await fetchApi({ projectId, id });
            const { params, responseBodyType } = api;

            const headerParams = params.filter(item => item.type === 'header');
            const pathParams = params.filter(item => item.type === 'path');
            const queryParams = params.filter(item => item.type === 'query');
            const bodyParams = params.filter(item => item.type === 'body');

            const responseHeaderParams = params.filter(item => item.type === 'response-header');
            let responseBodyParams = params.filter(item => item.type === 'response-body');

            let responseBodyRawParams;
            if ([ 'raw' ].includes(responseBodyType)) {
                responseBodyRawParams = responseBodyParams[0]?.defaultValue;
                responseBodyParams = [];
            }

            [ pathParams, queryParams, headerParams, bodyParams, responseBodyParams, responseHeaderParams ].forEach(arr => {
                if (arr?.length) {
                    arr.forEach(item => {
                        item.key = item.id;
                        item.parentKey = item.parentId;
                    });
                }
            });
            setApi(api);
            setHeaderParams(convertToTree(headerParams));
            setPathParams(convertToTree(pathParams));
            setQueryParams(convertToTree(queryParams));
            setBodyParams(convertToTree(bodyParams));
            setResponseHeaderParams(convertToTree(responseHeaderParams));
            setResponseBodyParams(convertToTree(responseBodyParams));

            setResponseBodyRawParams(responseBodyRawParams);
        })();
    }, [ id ]);

    const paramColumns = [
        { title: '字段名', dataIndex: 'field', width: 150 },
        { title: '类型', dataIndex: 'valueType', width: 100, render: value => <ValueType type={value}/> },
        { title: '必填', dataIndex: 'required', width: 100, render: value => <YesNoTag value={value}/> },
        // { title: '默认值', dataIndex: 'defaultValue', width: 150, render: value => value || '-' },
        { title: '描述', dataIndex: 'description', render: value => value || '-' },
    ];
    const mockPath = `${window.location.origin}/mock/${projectId}${api?.project?.apiPrefix || ''}${api.path}`;
    return (
        <PageContent styleName="root" loading={loading}>
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
                    <div styleName="label">状态</div>
                    <div styleName="value"><ApiStatus status={api.status}/></div>
                </div>
                <div styleName="item">
                    <div styleName="label">更新时间</div>
                    <div styleName="value">{moment(api.updatedAt).format('YYYY-MM-DD HH:mm')}</div>
                </div>
                <Row style={{ width: '100%' }}>
                    <Col span={12}>
                        <div styleName="item all">
                            <div styleName="label">接口路径</div>
                            <div styleName="value">
                                <ApiMethod method={api.method}/>
                                {api.path}
                                <Copy text={api.path}/>
                            </div>
                        </div>
                        <div styleName="item all">
                            <div styleName="label">Mock地址</div>
                            <div styleName="value">
                                {mockPath}
                                <Copy text={mockPath}/>
                            </div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div styleName="item all">
                            <div styleName="label" style={{ alignSelf: 'flex-start' }}>接口描述</div>
                            <div styleName="value">
                                {api.description}
                            </div>
                        </div>
                    </Col>
                </Row>
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
                            { title: '字段名', dataIndex: 'field', width: 150 },
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
            {headerParams?.length ? (
                <div styleName="params-box">
                    <h3>响应头（headers）</h3>
                    <Table
                        columns={[
                            { title: '字段名', dataIndex: 'field', width: 150 },
                            { title: '参数值', dataIndex: 'defaultValue', width: 200 },
                            { title: '必填', dataIndex: 'required', width: 100, render: value => <YesNoTag value={value}/> },
                            { title: '描述', dataIndex: 'description' },
                        ]}
                        dataSource={responseHeaderParams}
                        pagination={false}
                    />
                </div>
            ) : null}
            {responseBodyRawParams || responseBodyParams?.length ? (
                <div styleName="params-box">
                    <h3>响应体（body）</h3>
                    {[ 'raw' ].includes(api.responseBodyType) ? (
                        <div>{responseBodyRawParams}</div>
                    ) : (
                        <Table
                            columns={[
                                { title: '字段名', dataIndex: 'field', width: 150 },
                                { title: '参数值', dataIndex: 'mock', width: 200 },
                                { title: '必填', dataIndex: 'required', width: 100, render: value => <YesNoTag value={value}/> },
                                { title: '描述', dataIndex: 'description' },
                            ]}
                            dataSource={responseBodyParams}
                            pagination={false}
                        />
                    )}
                </div>
            ) : null}
        </PageContent>
    );
});
