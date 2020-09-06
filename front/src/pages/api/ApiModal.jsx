import React, { useState, useEffect } from 'react';
import { Form, Tabs } from 'antd';
import { FormElement } from 'src/library/components';
import config from 'src/commons/config-hoc';
import { ModalContent } from 'src/library/components';
import { useGet, usePost, usePut } from 'src/commons/ajax';
import { httpMethodOptions } from 'src/commons';
import CategorySelect from 'src/pages/category/CategorySelect';
import _ from 'lodash';
import PathInput from './PathInput';


const { TabPane } = Tabs;

export default config({
    modal: {
        title: props => props.isEdit ? '修改接口' : '添加接口',
        width: 600,
    },
})(props => {
    const { isEdit, id, projectId, categoryId, onOk } = props;
    const [ activeKey, setActiveKey ] = useState('simple');
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

    function checkFast(rule, value, callback) {
        if (!value) return callback('请输入内容');
        const arr = value.split('\n');

        if (!arr?.length || !arr.filter(it => !!it).length) return callback('请输入内容');

        for (let i = 0; i < arr.length; i++) {
            const line = arr[i];
            const lineNum = i + 1;

            if (!line) continue;

            const strs = line.split(' ').filter(item => !!item);
            const [ name, method, path ] = strs;
            if (!name || !method || !path) return callback(`第${lineNum}行， 格式不正确！name method path param1 ...`);

            if (!method) return callback(`第${lineNum}行，缺少method！比如：get post put delete 等`);

            const methodOk = httpMethodOptions.some(item => item.value === method.toLowerCase());
            if (!methodOk) return callback(`第${lineNum} 行， method填写错误！比如：get post put delete 等`);

            if (!path) return callback(`第${lineNum}行，缺少path！比如：/users/:id`);
            if (!path.startsWith('/')) return callback(`第${lineNum}行，path需要以 / 开头！比如：/users/:id`);
        }

        callback();
    }

    async function handleSubmit(values) {
        if (saving || updating) return;

        const { fast } = values;

        let apis = [];
        if (fast) {
            const lines = fast.split('\n').filter(it => !!it);
            apis = lines.map(line => {
                const items = line.split(' ').filter(item => !!item);
                const [ name, method, path, ...params ] = items;
                return { name, method: method.toLowerCase(), path, params };
            });
        }

        const ajaxMethod = isEdit ? updateApi : saveApi;

        const data = await ajaxMethod({ ...values, apis });

        onOk && onOk(data);
    }

    // 检测名字
    const checkName = _.debounce(async (rule, name, callback) => {
        if (!name) return callback();

        const api = await fetchApiByName({ projectId, name });

        if (!api) return callback();

        if ((isEdit && api.id !== id) || !isEdit) return callback('接口名称已被占用');

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
            bodyStyle={{ paddingTop: 0 }}
            loading={modalLoading}
            okText="保存"
            cancelText="重置"
            onOk={() => form.submit()}
            onCancel={() => form.resetFields()}
        >
            <Form
                name="api"
                form={form}
                onFinish={handleSubmit}
                initialValues={data}
                scrollToFirstError
            >
                {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}
                <FormElement {...formProps} type="hidden" name="projectId"/>
                <Tabs
                    activeKey={activeKey}
                    onChange={setActiveKey}
                >
                    <TabPane tab="表单填写" key="simple">
                        {activeKey === 'simple' ? (
                            <>
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

                                <PathInput
                                    form={form}
                                    formProps={formProps}
                                    projectId={projectId}
                                    id={id}
                                    isEdit={isEdit}
                                />

                                <FormElement
                                    {...formProps}
                                    type="textarea"
                                    label="接口描述"
                                    name="description"
                                    rows={3}
                                    placeholder="建议输入接口描述，便于开发人员理解接口用途，减少沟通成本"
                                />
                            </>
                        ) : null}
                    </TabPane>
                    <TabPane tab="快速填写" key="fast" disabled={isEdit}>
                        {activeKey === 'fast' ? (
                            <>
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
                                    type="textarea"
                                    label=" "
                                    colon={false}
                                    name="fast"
                                    elementStyle={{ height: 155 }}
                                    rules={[ { validator: checkFast } ]}
                                    placeholder={`快速批量添加，内容以空格隔开
规则为：
name method path param1 param2 ...
例如：
登录 post /login username password
                            `}
                                />
                            </>
                        ) : null}
                    </TabPane>
                </Tabs>
                <FormElement {...formProps} layout label=" ">
                    更多信息可以在接口编辑页面添加
                </FormElement>
            </Form>
        </ModalContent>
    );
});


