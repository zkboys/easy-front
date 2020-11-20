import React, { useState, useEffect } from 'react';
import { Form, Alert } from 'antd';
import { FormElement } from 'src/library/components';
import config from 'src/commons/config-hoc';
import { ModalContent } from 'src/library/components';
import { useGet, usePost, usePut } from 'src/commons/ajax';

export default config({
    modal: {
        title: props => props.isEdit ? '修改页面' : '创建页面',
        width: 500,
    },
})(props => {
    const { teamId } = props;
    const [ data, setData ] = useState({ teamId });
    const { isEdit, id, onOk } = props;
    const [ form ] = Form.useForm();
    const [ loading, fetchImagePage ] = useGet('/teams/:teamId/imagePages/:id');
    const [ saving, saveImagePage ] = usePost('/teams/:teamId/imagePages', { successTip: '添加成功！' });
    const [ updating, updateImagePage ] = usePut('/teams/:teamId/imagePages/:id', { successTip: '修改成功！' });

    async function fetchData() {
        if (loading) return;
        const res = await fetchImagePage({ teamId, id });

        setData(res || {});
        form.setFieldsValue(res || {});
    }

    async function handleSubmit(values) {
        if (saving || updating) return;

        const ajaxMethod = isEdit ? updateImagePage : saveImagePage;

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
            {!isEdit ? (
                <Alert
                    type="warning"
                    style={{ marginBottom: 16 }}
                    message="当前团队中所有成员将拥有此页面所有权限！"
                />
            ) : null}
            <Form
                name="imagePage"
                form={form}
                onFinish={handleSubmit}
                initialValues={{ teamId, ...data }}
            >
                {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}

                <FormElement {...formProps} type="hidden" name="teamId"/>
                <FormElement
                    {...formProps}
                    label="页面名称"
                    name="name"
                    required
                    autoFocus
                />
                <FormElement
                    {...formProps}
                    type="textarea"
                    label="页面描述"
                    name="description"
                    rows={6}
                />
            </Form>
        </ModalContent>
    );
});


