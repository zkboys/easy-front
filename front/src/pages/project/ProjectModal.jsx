import React, { useState, useEffect } from 'react';
import { Form, Alert } from 'antd';
import { FormElement } from 'src/library/components';
import config from 'src/commons/config-hoc';
import { ModalContent } from 'src/library/components';
import { useGet, usePost, usePut } from 'src/commons/ajax';

export default config({
    modal: {
        title: props => props.isEdit ? '修改项目' : '创建项目',
        width: 500,
    },
})(props => {
    const { teamId, teams, disabledTeam } = props;
    const [ data, setData ] = useState({ teamId });
    const { isEdit, id, onOk } = props;
    const [ form ] = Form.useForm();
    const [ loading, fetchProject ] = useGet('/projects/:id');
    const [ saving, saveProject ] = usePost('/projects', { successTip: '添加成功！' });
    const [ updating, updateProject ] = usePut('/projects/:id', { successTip: '修改成功！' });

    async function fetchData() {
        if (loading) return;
        const res = await fetchProject(id);

        setData(res || {});
        form.setFieldsValue(res || {});
    }

    async function handleSubmit(values) {
        if (saving || updating) return;

        const ajaxMethod = isEdit ? updateProject : saveProject;

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
            {!isEdit ? <Alert type="warning" style={{ marginBottom: 16 }} message="当前团队中所有成员将自动加入到此项目中"/> : null}
            <Form
                name="project"
                form={form}
                onFinish={handleSubmit}
                initialValues={data}
            >
                {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}

                <FormElement
                    {...formProps}
                    type="select"
                    label="所属团队"
                    name="teamId"
                    required
                    autoFocus
                    disabled={disabledTeam}
                    options={teams.map(item => ({ value: item.id, label: item.name }))}
                />
                <FormElement
                    {...formProps}
                    label="项目名称"
                    name="name"
                    required
                    autoFocus
                />
                <FormElement
                    {...formProps}
                    type="textarea"
                    label="项目描述"
                    name="description"
                    rows={6}
                />
            </Form>
        </ModalContent>
    );
});


