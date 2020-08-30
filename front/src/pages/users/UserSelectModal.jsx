import React from 'react';
import { Form } from 'antd';
import { FormElement } from 'src/library/components';
import { roleOptions } from 'src/commons';
import config from 'src/commons/config-hoc';
import { ModalContent } from 'src/library/components';
import UserSelect from './UserSelect';

export default config({
    modal: {
        title: '选择成员',
        width: 500,
    },
})(props => {
    const { loading, onOk, exclude, multiple } = props;
    const [ form ] = Form.useForm();

    async function handleSubmit(values) {
        onOk && onOk(values);
    }

    const formProps = {
        labelWidth: 100,
    };
    return (
        <ModalContent
            loading={loading}
            okText="确定"
            cancelText="重置"
            onOk={() => form.submit()}
            onCancel={() => form.resetFields()}
        >
            <Form
                form={form}
                onFinish={handleSubmit}
                initialValues={{ role: 'master' }}
            >
                <FormElement
                    {...formProps}
                    label="成员"
                    name="userId"
                    required
                    autoFocus
                >
                    <UserSelect mode={multiple ? 'multiple' : undefined} exclude={exclude}/>
                </FormElement>
                <FormElement
                    {...formProps}
                    type="select"
                    label="角色"
                    name="role"
                    required
                    options={roleOptions}
                />
            </Form>
        </ModalContent>
    );
});


