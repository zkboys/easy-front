import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import { FormElement } from 'src/library/components';
import config from 'src/commons/config-hoc';
import { ModalContent } from 'src/library/components';
import { useGet, usePost, usePut } from 'src/commons/ajax';

export default config({
    modal: {
        title: props => props.isEdit ? '修改分类' : '添加分类',
        width: 500,
    },
})(props => {
    const { isEdit, id, projectId, onOk } = props;
    const [ data, setData ] = useState({ projectId });

    const [ form ] = Form.useForm();
    const [ loading, fetchCategory ] = useGet('/projects/:projectId/categories/:id');

    const [ saving, saveCategory ] = usePost('/projects/:projectId/categories', { successTip: '添加成功！' });
    const [ updating, updateCategory ] = usePut('/projects/:projectId/categories/:id', { successTip: '修改成功！' });

    async function fetchData() {
        if (loading) return;
        const res = await fetchCategory({ projectId, id });

        setData(res || {});
        form.setFieldsValue(res || {});
    }

    async function handleSubmit(values) {
        if (saving || updating) return;

        const ajaxMethod = isEdit ? updateCategory : saveCategory;

        const data = await ajaxMethod(values);

        onOk && onOk(data);
    }

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
                <FormElement
                    {...formProps}
                    label="分类名称"
                    name="name"
                    required
                    autoFocus
                />
                <FormElement
                    {...formProps}
                    type="textarea"
                    label="分类描述"
                    name="description"
                    rows={6}
                    required
                />
            </Form>
        </ModalContent>
    );
});


