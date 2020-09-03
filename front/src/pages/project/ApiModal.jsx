import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import { FormElement } from 'src/library/components';
import config from 'src/commons/config-hoc';
import { ModalContent } from 'src/library/components';
import { useGet, usePost, usePut } from 'src/commons/ajax';
import { httpMethodOptions } from 'src/commons';
import CategorySelect from './CategorySelect';
import './style.less';
import _ from 'lodash';

export default config({
    modal: {
        title: props => props.isEdit ? '修改接口' : '添加接口',
        width: 500,
    },
})(props => {
    const { isEdit, id, projectId, categoryId, onOk } = props;
    const isAll = categoryId === 'all';
    const [ data, setData ] = useState({
        projectId,
        categoryId: isAll ? undefined : categoryId,
        method: 'get',
    });

    const [ form ] = Form.useForm();
    const [ loading, fetchApi ] = useGet('/projects/:projectId/apis/:id');
    const [ , fetchApiByName ] = useGet('/projects/:projectId/apiByName');
    const [ saving, saveApi ] = usePost('/projects/:projectId/apis/', { successTip: '添加成功！' });
    const [ updating, updateApi ] = usePut('/projects/:projectId/apis/:id', { successTip: '修改成功！' });

    async function fetchData() {
        if (loading) return;
        const res = await fetchApi({ projectId, categoryId, id });

        setData(res || {});
        form.setFieldsValue(res || {});
    }

    async function handleSubmit(values) {
        if (saving || updating) return;

        const ajaxMethod = isEdit ? updateApi : saveApi;

        const data = await ajaxMethod(values);

        onOk && onOk(data);
    }

    // 搜索接口
    const checkName = _.debounce(async (rule, name, callback) => {
        if (!name) return callback();

        const api = await fetchApiByName({ projectId, name });

        if ((isEdit && api && api.id !== id) || (!isEdit && api)) return callback('接口名称已被占用');

        return callback();
    }, 300);

    useEffect(() => {
        (async () => {
            if (isEdit) await fetchData();
        })();
    }, []);

    const formProps = {
        labelWidth: 100,
    };
    const modalLoading = loading || saving || updating;
    return (
        <ModalContent
            loading={modalLoading}
            okText="保存"
            cancelText="重置"
            onOk={() => form.submit()}
            onCancel={() => form.resetFields()}
        >
            <Form
                form={form}
                onFinish={handleSubmit}
                initialValues={data}
            >
                {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}
                <FormElement {...formProps} type="hidden" name="projectId"/>
                <FormElement {...formProps} type="hidden" name="categoryId"/>
                <FormElement
                    {...formProps}
                    label="接口分类"
                    name="categoryId"
                    required
                    autoFocus={isAll}
                    allowClear={false}
                >
                    <CategorySelect projectId={projectId}/>
                </FormElement>
                <FormElement
                    {...formProps}
                    label="接口名称"
                    name="name"
                    required
                    autoFocus={!isAll}
                    rules={[
                        { validator: checkName },
                    ]}
                />

                <div styleName="api-path-input">
                    <FormElement
                        {...formProps}
                        style={{ flex: '0 0 200px' }}
                        type="select"
                        label="接口地址"
                        name="method"
                        required
                        options={httpMethodOptions}
                    />
                    <FormElement
                        style={{ flex: 1 }}
                        name="path"
                        label="接口地址"
                        labelWidth={0}
                        colon={false}
                        required
                        placeholder="/path"
                        rules={[
                            {
                                validator: (rule, value) => {
                                    if (value && !value.startsWith('/')) return Promise.reject('接口地址需要以 / 开头！');

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    />
                </div>

                <FormElement
                    {...formProps}
                    type="textarea"
                    label="接口描述"
                    name="description"
                    rows={3}
                    placeholder="建议输入接口描述，便于开发人员理解接口用途，减少沟通成本"
                />
                <FormElement
                    {...formProps}
                    type="textarea"
                    layout
                    label=" "
                >
                    更多信息可以在接口编辑页面添加
                </FormElement>
            </Form>
        </ModalContent>
    );
});


