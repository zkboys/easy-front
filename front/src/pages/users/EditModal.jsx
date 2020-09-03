import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import { FormElement } from 'src/library/components';
import config from 'src/commons/config-hoc';
import { ModalContent } from 'src/library/components';
import { useGet, usePost, usePut } from 'src/commons/ajax';

export default config({
    modal: {
        title: props => props.isEdit ? '修改用户' : '创建用户',
        width: 500,
    },
})(props => {
    const [ data, setData ] = useState({});
    const { isEdit, id, onOk } = props;
    const [ form ] = Form.useForm();
    const [ loading, fetchUser ] = useGet('/users/:id');
    const [ saving, saveUser ] = usePost('/register', { successTip: '添加成功！' });
    const [ updating, updateUser ] = usePut('/users/:id', { successTip: '修改成功！' });

    async function fetchData() {
        if (loading) return;
        const res = await fetchUser(id);

        if (isEdit) res.password = undefined;
        setData(res || {});
        form.setFieldsValue(res || {});
    }

    async function handleSubmit(values) {
        if (saving || updating) return;

        const ajaxMethod = isEdit ? updateUser : saveUser;
        await ajaxMethod(values);

        onOk && onOk();
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
                name="user"
                form={form}
                onFinish={handleSubmit}
                initialValues={data}
            >
                {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}

                <FormElement
                    {...formProps}
                    label="账号"
                    name="account"
                    required
                    noSpace
                    autoFocus
                />
                <FormElement
                    {...formProps}
                    label="姓名"
                    name="name"
                    required
                />
                <FormElement
                    {...formProps}
                    type="password"
                    label="密码"
                    name="password"
                />
                <FormElement
                    {...formProps}
                    label="邮箱"
                    name="email"
                    email
                />
            </Form>
        </ModalContent>
    );
});


