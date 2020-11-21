import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import { FormElement } from 'src/library/components';
import config from 'src/commons/config-hoc';
import { ModalContent } from 'src/library/components';
import { useGet, usePost, usePut } from 'src/commons/ajax';

export default config({
    modal: {
        title: props => props.isEdit ? '修改资源文件' : '创建资源文件',
        width: 500,
    },
})(props => {
    const [ data, setData ] = useState({});
    const { isEdit, id, onOk, teamId } = props;
    const [ form ] = Form.useForm();
    const [ loading, fetchHotBlockFile ] = useGet(`/teams/${teamId}/hotBlockFiles/:id`);
    const [ saving, saveHotBlockFile ] = usePost(`/teams/${teamId}/hotBlockFiles`, { successTip: '添加成功！' });
    const [ updating, updateHotBlockFile ] = usePut(`/teams/${teamId}/hotBlockFiles/:id`, { successTip: '修改成功！' });

    async function fetchData() {
        if (loading) return;
        const res = await fetchHotBlockFile(id);

        if (isEdit) res.password = undefined;
        setData(res || {});
        form.setFieldsValue(res || {});
    }

    async function handleSubmit(values) {
        if (saving || updating) return;

        const ajaxMethod = isEdit ? updateHotBlockFile : saveHotBlockFile;
        await ajaxMethod(values);

        onOk && onOk();
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
                name="hotBlockFile"
                form={form}
                onFinish={handleSubmit}
                initialValues={data}
            >
                {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}

                <FormElement
                    {...formProps}
                    label="文件名"
                    name="name"
                    required
                    noSpace
                    autoFocus
                />
                <FormElement
                    {...formProps}
                    label="文件描述"
                    name="description"
                    required
                />
                <FormElement
                    {...formProps}
                    label="上传文件"
                    name="url"
                />
            </Form>
        </ModalContent>
    );
});


