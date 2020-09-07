import React, { useState, useEffect } from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import './EditStyle.less';
import { FormElement } from '@/library/components';
import BlockTitle from '@/components/block-title';
import { Button, Form, Modal } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import Help from '@/components/help';
import HttpParams from '@/components/http-params';
import { useGet, usePut } from '@/commons/ajax';
import TeamSelect from 'src/pages/team/TeamSelect';
import _ from 'lodash';

export default config()(props => {
    const { id: projectId, height, onSubmit } = props;
    const [ form ] = Form.useForm();

    const [ project, setProject ] = useState(null);

    const [ loading, fetchProject ] = useGet('/projects/:id');
    const [ , fetchProjectByName ] = useGet('/teams/:teamId/projects/byName');
    const [ updating, updateProject ] = usePut('/projects/:id', { successTip: '更新成功！' });

    const teamId = project?.teamId;

    async function handleSubmit(values) {

        const {
            headerParams,
            responseHeaderParams,
        } = values;
        const params = {
            headerParams,
            responseHeaderParams,
        };

        const nameMap = {
            headerParams: '请求头',
            responseHeaderParams: '响应头',
        };

        for (const item of Object.entries(params)) {
            const [ key, value ] = item;
            if (!value?.length) continue;

            // 校验
            await Promise.all(params[key].map(record => record?._form?.validateFields())).catch(e => {
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

        const result = await updateProject({ ...values, ...params });
        onSubmit(result);
    }

    const checkName = _.debounce(async (rule, name, callback) => {
        if (!name) return callback();

        const api = await fetchProjectByName({ teamId, name });
        if (api && api.id !== projectId) return callback('项目名称已被占用');

        return callback();
    }, 300);

    useEffect(() => {
        (async () => {
            const project = await fetchProject(projectId);

            const params = project.params;
            if (params && params.length) {
                const headerParams = params.filter(item => item.type === 'header');
                const responseHeaderParams = params.filter(item => item.type === 'response-header');

                project.headerParams = headerParams;
                project.responseHeaderParams = responseHeaderParams;
            }
            form.setFieldsValue(project);
            setProject(project);
        })();
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
                initialValues={project}
                scrollToFirstError
            >
                <div
                    styleName="top"
                    style={{ height: height - 32 }}
                >
                    <FormElement {...formProps} type="hidden" name="id"/>

                    <div>
                        <BlockTitle>基本信息</BlockTitle>
                        <FormElement
                            {...formProps}
                            label="归属团队"
                            name="teamId"
                            required
                            allowClear={false}
                        >
                            <TeamSelect/>
                        </FormElement>
                        <FormElement
                            {...formProps}
                            label="项目名称"
                            name="name"
                            required
                            autoFocus
                            rules={[
                                { validator: checkName },
                            ]}
                        />
                        <FormElement
                            {...formProps}
                            label="接口前缀"
                            name="apiPrefix"
                        />

                        <FormElement
                            {...formProps}
                            type="textarea"
                            label="项目描述"
                            name="description"
                            rows={3}
                            placeholder="建议输入接口描述，便于开发人员理解接口用途，减少沟通成本"
                        />
                    </div>

                    <div styleName="params-box">
                        <h3>默认请求头（header）<Help type="paramHeader"/></h3>
                        <FormElement
                            labelWidth={0}
                            name="headerParams"
                        >
                            <HttpParams
                                fieldType="header"
                                tabIndexStart={1}
                                fields={[ 'field', 'defaultValue', 'required', 'description' ]}
                            />
                        </FormElement>
                    </div>

                    <div styleName="params-box">
                        <h3>默认响应头（header）</h3>
                        <FormElement
                            labelWidth={0}
                            name="responseHeaderParams"
                        >
                            <HttpParams
                                fieldType="header"
                                tabIndexStart={4000}
                                fields={[ 'field', 'defaultValue', 'description' ]}
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
