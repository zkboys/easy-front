import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import { FormElement } from 'src/library/components';
import config from 'src/commons/config-hoc';
import { ModalContent } from 'src/library/components';
import { useGet, usePost, usePut } from 'src/commons/ajax';

export default config({
    modal: {
        title: props => props.isEdit ? '修改团队' : '创建团队',
        width: 500,
    },
})(props => {
    const [ data, setData ] = useState({});
    const { isEdit, id, onOk } = props;
    const [ form ] = Form.useForm();
    const [ loading, fetchTeam ] = useGet('/teams/:id');
    const [ saving, saveTeam ] = usePost('/teams', { successTip: '添加成功！' });
    const [ updating, updateTeam ] = usePut('/teams/:id', { successTip: '修改成功！' });

    async function fetchData() {
        if (loading) return;
        const res = await fetchTeam(id);

        setData(res || {});
        form.setFieldsValue(res || {});
    }

    async function handleSubmit(values) {
        if (saving || updating) return;

        const ajaxMethod = isEdit ? updateTeam : saveTeam;

        const data = await ajaxMethod(values);

        onOk && onOk(data);
    }

    useEffect(() => {
        if (isEdit) fetchData();
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

                <FormElement
                    {...formProps}
                    label="团队名称"
                    name="name"
                    required
                    autoFocus
                />
                <FormElement
                    {...formProps}
                    type="textarea"
                    label="团队描述"
                    name="description"
                    rows={6}
                    required
                />
            </Form>
        </ModalContent>
    );
});


