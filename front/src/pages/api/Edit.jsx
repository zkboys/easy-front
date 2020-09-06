import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Tooltip, Modal } from 'antd';
import { SaveOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import { useGet, usePut } from 'src/commons/ajax';
import Help from 'src/components/help';
import BlockTitle from 'src/components/block-title';
import HttpParams from 'src/components/http-params';

import { FormElement } from 'src/library/components';
import { convertToTree } from 'src/library/utils/tree-utils';
import CategorySelect from 'src/pages/category/CategorySelect';
import { apiStatusOptions, getPathParams } from 'src/commons';
import _ from 'lodash';
import PathInput from './PathInput';

import './EditStyle.less';

export default config()(props => {
    const { id, projectId, height, onSubmit } = props;
    const [ form ] = Form.useForm();

    const topEl = useRef(null);
    const [ api, setApi ] = useState(null);
    const [ pathParams, setPathParams ] = useState([]);
    const [ search, setSearch ] = useState({});

    const [ loading, fetchApi ] = useGet('/projects/:projectId/apis/:id');
    const [ , fetchApiByName ] = useGet('/projects/:projectId/apiByName');
    const [ updating, updateApi ] = usePut('/projects/:projectId/apis/:id', { successTip: '修改成功！' });

    const handlePathBlur = e => {
        const params = getPathParams(e.target.value);
        const newPathParams = params.map(p => {
            const exit = pathParams.find(item => item.field === p.field) || {};
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

        const {
            headerParams,
            pathParams = [],
            queryParams,
            bodyParams,
            responseHeaderParams,
            responseBodyParams,
        } = values;

        const nameMap = {
            headerParams: '请求头',
            pathParams: '地址参数',
            queryParams: '查询字符串',
            bodyParams: '请求体',
            responseHeaderParams: '响应头',
            responseBodyParams: '响应体',
        };
        const params = {
            headerParams,
            pathParams,
            queryParams,
            bodyParams,
            responseHeaderParams,
            responseBodyParams,
        };

        const convert = nodes => {
            const result = [];
            if (!nodes?.length) return result;

            const loop = nodes => {
                if (!nodes?.length) return;

                nodes.forEach(node => {
                    const { children, ...others } = node;
                    result.push(others);
                    if (children?.length) {
                        loop(children);
                    }
                });
            };
            loop(nodes);

            return result;
        };

        for (const item of Object.entries(params)) {
            const [ key, value ] = item;
            if (!value?.length) continue;
            // 扁平
            params[key] = convert(value);

            // 校验
            await Promise.all(params[key].map(record => record._form.validateFields())).catch(e => {
                const name = nameMap[key];
                Modal.info({
                    title: '提示',
                    content: `「${name}」表格中数据填写有误，请修正后重新保存！`,
                });

                throw e;
            });
        }

        // 处理数据，删除前端添加的一些标记性数据
        Object.values(params).forEach(arr => {
            if (!arr) return;
            arr.forEach(data => {
                if (!data) return;
                Object.keys(data).forEach(key => {
                    if (key.startsWith('_')) {
                        Reflect.deleteProperty(data, key);
                    }
                });
            });
        });

        const result = await updateApi({ ...values, ...params });

        onSubmit && onSubmit(result);

        // 触发查询
        setSearch({});
    };

    // 搜索接口
    const checkName = _.debounce(async (rule, name, callback) => {
        if (!name) return callback();

        const api = await fetchApiByName({ projectId, name });
        if (api && api.id !== id) return callback('接口名称已被占用');

        return callback();
    }, 300);

    // 请求api数据
    useEffect(() => {
        (async () => {
            const api = await fetchApi({ projectId, id });
            if (!api) return setApi(null);

            const { params } = api;
            const headerParams = params.filter(item => item.type === 'header');
            const pathParams = params.filter(item => item.type === 'path').map(item => {
                item.valueType = item.valueType || undefined;
                return item;
            });
            const queryParams = params.filter(item => item.type === 'query');
            const bodyParams = params.filter(item => item.type === 'body');
            const responseHeaderParams = params.filter(item => item.type === 'response-header');
            const responseBodyParams = params.filter(item => item.type === 'response-body');

            [ pathParams, queryParams, headerParams, bodyParams, responseBodyParams, responseHeaderParams ].forEach(arr => {
                if (arr?.length) {
                    arr.forEach(item => {
                        item.key = item.id;
                        item.parentKey = item.parentId;
                    });
                }
            });

            api.pathParams = convertToTree(pathParams);
            api.queryParams = convertToTree(queryParams);
            api.headerParams = convertToTree(headerParams);
            api.bodyParams = convertToTree(bodyParams);
            api.responseHeaderParams = convertToTree(responseHeaderParams);
            api.responseBodyParams = convertToTree(responseBodyParams);

            setApi(api);

            setPathParams(pathParams);

            form.setFieldsValue(api);

            // 滚动条滚动到顶部
            // topEl.current.scrollTop = 0;
        })();

    }, [ id, search ]);

    async function handleWindowKeyDown(e) {
        const { keyCode, ctrlKey, metaKey } = e;
        const isS = keyCode === 83;
        if ((ctrlKey || metaKey) && isS) {
            e.preventDefault();

            const values = await form.validateFields();
            await handleSubmit(values);
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleWindowKeyDown);

        return () => window.removeEventListener('keydown', handleWindowKeyDown);
    }, []);
    const formProps = {
        labelWidth: 100,
    };
    return (
        <PageContent styleName="root" loading={loading}>
            <Form
                name="api-edit"
                form={form}
                onFinish={handleSubmit}
                initialValues={api}
                scrollToFirstError
            >
                <div
                    ref={topEl}
                    styleName="top"
                    style={{ height: height - 84 }}
                >
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

                        <PathInput
                            form={form}
                            formProps={formProps}
                            projectId={projectId}
                            id={id}
                            isEdit={true}
                            onBlur={handlePathBlur}
                        />

                        <FormElement
                            {...formProps}
                            label="状态"
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

                    <BlockTitle>
                        请求参数
                        <Tooltip
                            overlayClassName="edit-param-help"
                            overlayStyle={{ width: 500 }}
                            title={(
                                <div>
                                    <div>编辑说明：</div>
                                    <div>1. 点击Tab键，进入下一个输入框；</div>
                                    <div>2. 点击Enter键，编辑下一个输入框；</div>
                                    <div>3. 点击上、下方向键，编辑上、下一个输入框；</div>
                                    <div>4. 按住Ctrl 或 Command 或 Shift + Enter键，新增一行；</div>
                                    <div>5. 按住Ctrl 或 Command键 + 点击删除，直接删除无提示；</div>
                                </div>
                            )}
                        >
                            <QuestionCircleOutlined style={{ margin: '0 4px' }}/>
                        </Tooltip>
                    </BlockTitle>
                    <div styleName="params-box">
                        <h3>请求头（header）<Help type="paramHeader"/></h3>
                        <FormElement
                            labelWidth={0}
                            name="headerParams"
                        >
                            <HttpParams
                                tabIndexStart={1}
                                fields={[ 'field', 'defaultValue', 'required', 'description' ]}
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
                                    disabledFields={[ 'field', 'required' ]}
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
                    <div styleName="params-box">
                        <h3>请求体（body）<Help type="paramBody"/></h3>
                        <FormElement
                            labelWidth={0}
                            name="bodyParams"
                        >
                            <HttpParams tabIndexStart={3000}/>
                        </FormElement>
                    </div>

                    <BlockTitle>响应结果（200）</BlockTitle>
                    <div styleName="params-box">
                        <h3>响应头（header）</h3>
                        <FormElement
                            labelWidth={0}
                            name="responseHeaderParams"
                        >
                            <HttpParams
                                tabIndexStart={4000}
                                fields={[ 'field', 'defaultValue', 'description' ]}
                            />
                        </FormElement>
                    </div>
                    <div styleName="params-box">
                        <h3>响应体（body）</h3>
                        <FormElement
                            labelWidth={0}
                            name="responseBodyParams"
                        >
                            <HttpParams
                                tabIndexStart={5000}
                                fields={[ 'field', 'valueType', 'mock', 'description' ]}
                            />
                        </FormElement>
                    </div>
                </div>
                <div styleName="bottom">
                    <Button
                        type="primary"
                        icon={<SaveOutlined/>}
                        onClick={() => form.submit()}
                    >保存</Button>
                </div>
            </Form>
        </PageContent>
    );
});
