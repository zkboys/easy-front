import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { Table, Form, Tabs, Space, Affix, Button } from 'antd';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import FixBottom from 'src/layouts/fix-bottom';
import { useGet, usePost, usePut } from 'src/commons/ajax';
import ApiStatus from 'src/components/api-status';
import ApiMethod from 'src/components/api-method';
import UserLink from 'src/components/user-link';
import Help from 'src/components/help';
import Copy from 'src/components/copy';
import YesNoTag from 'src/components/yes-no-tag';
import ValueType from '@/components/value-type';
import BlockTitle from '@/components/block-title';
import HttpParams from 'src/components/http-params';

import { FormElement } from '@/library/components';
import CategorySelect from '@/pages/category/CategorySelect';
import { httpMethodOptions, apiStatusOptions, getPathParams } from '@/commons';
import _ from 'lodash';
import PathInput from './PathInput';

import './EditStyle.less';

export default config()(props => {
    const { id, projectId, height, onSubmit } = props;
    const [ form ] = Form.useForm();

    const topEl = useRef(null);
    const [ api, setApi ] = useState({});
    const [ headerParams, setHeaderParams ] = useState([]);
    const [ pathParams, setPathParams ] = useState([]);
    const [ queryParams, setQueryParams ] = useState([]);
    const [ bodyParams, setBodyParams ] = useState([]);

    const [ loading, fetchApi ] = useGet('/projects/:projectId/apis/:id');
    const [ , fetchApiByName ] = useGet('/projects/:projectId/apiByName');
    const [ updating, updateApi ] = usePut('/projects/:projectId/apis/:id', { successTip: '修改成功！' });

    const handlePathBlur = e => {
        const params = getPathParams(e.target.value);
        const newPathParams = params.map(p => {
            const exit = pathParams.find(item => item.key === p.key) || {};
            const param = { ...exit, ...p };
            if (!param.valueType) param.valueType = 'string';
            param.required = true;
            return param;
        });
        setPathParams(newPathParams);
        form.setFieldsValue({ pathParams: newPathParams });
    };

    const handleSubmit = async (values) => {
        if (updating) return;

        const { queryParams } = values;

        // 校验
        if (queryParams?.length) {
            await Promise.all(queryParams.map(record => record._form.validateFields()));
        }

        const result = await updateApi({ ...values });

        onSubmit && onSubmit(result);
    };

    // 搜索接口
    const checkName = _.debounce(async (rule, name, callback) => {
        if (!name) return callback();

        const api = await fetchApiByName({ projectId, name });
        if (api && api.id !== id) return callback('接口名称已被占用');

        return callback();
    }, 300);

    useEffect(() => {
        (async () => {
            const api = await fetchApi({ projectId, id });
            const { params } = api;
            const headerParams = params.filter(item => item.type === 'header');
            const pathParams = params.filter(item => item.type === 'path').map(item => {
                if (!item.valueType) item.valueType = undefined;

                return item;
            });
            const queryParams = params.filter(item => item.type === 'query');
            const bodyParams = params.filter(item => item.type === 'body');

            api.pathParams = pathParams;
            api.queryParams = queryParams;
            api.headerParams = headerParams;
            setApi(api);

            setHeaderParams(headerParams);
            setPathParams(pathParams);
            setQueryParams(queryParams);
            setBodyParams(bodyParams);


            form.setFieldsValue(api);

            // 滚动条滚动到顶部
            topEl.current.scrollTop = 0;
        })();

    }, [ id ]);

    const paramColumns = [
        { title: '字段名', dataIndex: 'key', width: 150 },
        { title: '类型', dataIndex: 'valueType', width: 100, render: value => <ValueType type={value}/> },
        { title: '必填', dataIndex: 'required', width: 100, render: value => <YesNoTag value={value}/> },
        { title: '默认值', dataIndex: 'defaultValue', width: 150, render: value => value || '-' },
        { title: '描述', dataIndex: 'description', render: value => value || '-' },
    ];
    const mockPath = `${window.location.origin}/mock/${projectId}${api?.project?.apiPrefix || ''}${api.path}`;
    const formProps = {
        labelWidth: 100,
    };
    return (
        <PageContent styleName="root">
            <Form
                name="api-edit"
                form={form}
                onFinish={handleSubmit}
                initialValues={api}
            >
                <div ref={topEl} styleName="top" style={{ height: height - 84 }}>
                    <FormElement {...formProps} type="hidden" name="id"/>
                    <FormElement {...formProps} type="hidden" name="projectId"/>

                    <div>
                        <BlockTitle>基本信息</BlockTitle>
                        <FormElement
                            {...formProps}
                            label="接口分类"
                            name="categoryId"
                            required
                            allowClear={false}
                        >
                            <CategorySelect projectId={projectId}/>
                        </FormElement>
                        <FormElement
                            {...formProps}
                            label="接口名称"
                            name="name"
                            required
                            autoFocus
                            rules={[
                                { validator: checkName },
                            ]}
                        />

                        <PathInput formProps={formProps} onBlur={handlePathBlur}/>

                        <FormElement
                            {...formProps}
                            label="后端状态"
                            type="radio-button"
                            name="status"
                            options={apiStatusOptions}
                            required
                        />

                        <FormElement
                            {...formProps}
                            type="textarea"
                            label="接口描述"
                            name="description"
                            rows={3}
                            placeholder="建议输入接口描述，便于开发人员理解接口用途，减少沟通成本"
                        />
                    </div>

                    <BlockTitle>请求参数</BlockTitle>
                    <div styleName="params-box">
                        <h3>请求头（headers）<Help type="paramHeader"/></h3>
                        <FormElement
                            labelWidth={0}
                            name="headerParams"
                        >
                            <HttpParams
                                tabIndexStart={1}
                                fields={[ 'key', 'defaultValue', 'required', 'description', 'operator' ]}
                            />
                        </FormElement>
                    </div>
                    {pathParams?.length ? (
                        <div styleName="params-box">
                            <h3>地址参数（path）<Help type="paramPath"/></h3>
                            <span style={{
                                marginLeft: 16,
                                color: '#faad15',
                                fontSize: 12,
                                fontWeight: 'normal',
                            }}>
                                注：修改「接口地址」会自动同步！
                            </span>
                            <FormElement
                                labelWidth={0}
                                name="pathParams"
                            >
                                <HttpParams
                                    tabIndexStart={1000}
                                    addable={false}
                                    deletable={false}
                                    disabledFields={[ 'key', 'required' ]}
                                />
                            </FormElement>
                        </div>
                    ) : null}
                    <div styleName="params-box">
                        <h3>查询字符串（query）<Help type="paramQuery"/></h3>
                        <FormElement
                            labelWidth={0}
                            name="queryParams"
                        >
                            <HttpParams tabIndexStart={2000}/>
                        </FormElement>
                    </div>
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
                </div>
                <div styleName="bottom">
                    <Button type="primary" onClick={() => form.submit()}>保存</Button>
                </div>
            </Form>
        </PageContent>
    );
});
