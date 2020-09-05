import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Select } from 'antd';

import PageContent from 'src/layouts/page-content';
import config from 'src/commons/config-hoc';
import batchDeleteConfirm from 'src/components/batch-delete-confirm';
import { useGet, useDel, usePost, usePut } from 'src/commons/ajax';
import api from './useApi';
import {
    FormElement,
    FormRow,
    Operator,
    Pagination,
    QueryBar,
    Table,
} from 'src/library/components';

import EditModal from './EditModal';
import UserLink from '@/components/user-link';

export default config({
    pageHead: true,
    path: '/users',
    title: '用户管理',
})(() => {
    // 数据定义
    const [ { condition, pageSize, pageNum }, setCondition ] = useState({ condition: {}, pageSize: 20, pageNum: 1 });
    const [ dataSource, setDataSource ] = useState([]);
    const [ selectedRowKeys, setSelectedRowKeys ] = useState([]);
    const [ total, setTotal ] = useState(0);
    const [ visible, setVisible ] = useState(false);
    const [ id, setId ] = useState(null);
    const [ roleOptions, setRoleOptions ] = useState([]);
    const [ form ] = Form.useForm();

    // 请求相关定义 只是定义，不会触发请求，调用相关函数，才会触发请求
    const [ loading, fetchUsers ] = useGet('/users');
    const [ deleting, deleteUsers ] = api.deleteUsers(); // 可以单独封装成api
    const [ deletingOne, deleteUser ] = useDel('/users/:id', { successTip: '删除成功！' });
    const [ syncing, syncWeChatUsers ] = usePost('/syncWeChat', { successTip: '同步成功！', errorTip: '同步失败！' });
    const [ fetchRolesLoading, fetchRoles ] = useGet('/roles');
    const [ , relateRole ] = usePut('/relateUserRoles');

    const handleRolesChange = async (roleIds, record) => {
        const userId = record.id;

        await relateRole({ userId, roleIds });

        const roles = roleIds.map(id => {
            const name = roleOptions.find(item => item.value === id)?.label;
            return { id, name };
        });

        const data = dataSource.find(item => item.id === record.id);
        if (data) data.roles = roles;

        setDataSource([ ...dataSource ]);
    };

    const columns = [
        { title: '账号', dataIndex: 'account', width: 200 },
        {
            title: '用户名', dataIndex: 'name', width: 200,
            render: (name, record) => <UserLink user={record}/>,
        },
        {
            title: '角色', dataIndex: 'roles', width: 400,
            render: (value, recode) => {
                if (recode.isAdmin) return '超级管理员';
                const roleIds = value.map(item => item.id);
                return (
                    <Select
                        style={{ width: '100%' }}
                        mode="multiple"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        value={roleIds}
                        onChange={(ids) => handleRolesChange(ids, recode)}
                        options={roleOptions}
                        placeholder="请选择角色"
                    />
                );
            },
        },
        { title: '职位', dataIndex: 'position' },
        {
            title: '操作', dataIndex: 'operator', width: 100,
            render: (value, record) => {
                const { id, name, frozen } = record;

                if (frozen) return;

                const items = [
                    {
                        label: '编辑',
                        onClick: () => setVisible(true) || setId(id),
                    },
                    {
                        label: '删除',
                        color: 'red',
                        confirm: {
                            title: `您确定删除"${name}"?`,
                            onConfirm: () => handleDelete(id),
                        },
                    },
                ];

                return <Operator items={items}/>;
            },
        },
    ];

    // 函数定义
    async function handleSearch() {
        if (loading) return;
        const params = {
            ...condition,
            pageNum,
            pageSize,
        };

        const res = await fetchUsers(params);

        setDataSource(res?.rows || []);
        setTotal(res?.count || 0);
    }

    async function handleDelete(id) {
        if (deletingOne) return;

        await deleteUser(id);
        await handleSearch();
    }

    async function handleBatchDelete() {
        if (deleting) return;

        await batchDeleteConfirm(selectedRowKeys.length);

        await deleteUsers({ ids: selectedRowKeys });
        setSelectedRowKeys([]);
        await handleSearch();
    }

    async function syncWeChat() {
        if (syncing) return;

        Modal.confirm({
            title: '提示',
            content: '您确定同步微信用户以及组织架构吗？',
            onOk: () => {
                (async () => {
                    await syncWeChatUsers();
                    await handleSearch();
                })();
            },
        });
    }

    // 查询条件 角色改变 触发查询
    const handleRoleChange = async () => {
        const condition = await form.validateFields();
        setCondition({ condition, pageSize, pageNum: 1 });
    };

    // condition pageNum pageSize 改变触发查询
    useEffect(() => {
        (async () => {
            await handleSearch();
        })();
    }, [
        condition,
        pageNum,
        pageSize,
    ]);

    useEffect(() => {
        (async () => {
            const roles = await fetchRoles();
            const roleOptions = roles.map(item => ({ value: item.id, label: item.name }));
            setRoleOptions(roleOptions);
        })();
    }, []);

    // jsx 用到的数据
    const formProps = { width: 200 };
    const pageLoading = loading
        || deleting
        || deletingOne
        || syncing
        || fetchRolesLoading;
    const disabledDelete = !selectedRowKeys?.length || pageLoading;

    return (
        <PageContent loading={pageLoading}>
            <QueryBar>
                <Form name="user-query" form={form} onFinish={condition => setCondition({ condition, pageSize, pageNum: 1 })}>
                    <FormRow>
                        <FormElement
                            {...formProps}
                            width={300}
                            label="名称/账号/邮箱"
                            name="keyWord"
                        />
                        <FormElement
                            {...formProps}
                            allowClear
                            type="select"
                            label="角色"
                            name="roleId"
                            options={roleOptions}
                            onChange={handleRoleChange}
                        />
                        <FormElement layout>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={() => form.resetFields()}>重置</Button>
                            <Button type="primary" onClick={() => setVisible(true) || setId(null)}>添加</Button>
                            <Button danger disabled={disabledDelete} onClick={handleBatchDelete}>删除</Button>
                            <Button danger onClick={syncWeChat}>同步微信</Button>
                        </FormElement>
                    </FormRow>
                </Form>
            </QueryBar>
            <Table
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                serialNumber
                pageNum={pageNum}
                pageSize={pageSize}
            />
            <Pagination
                total={total}
                pageNum={pageNum}
                pageSize={pageSize}
                onPageNumChange={pageNum => setCondition({ condition, pageSize, pageNum })}
                onPageSizeChange={pageSize => setCondition({ condition, pageSize, pageNum: 1 })}
            />
            <EditModal
                visible={visible}
                id={id}
                isEdit={id !== null}
                onOk={() => setVisible(false) || handleSearch()}
                onCancel={() => setVisible(false)}
            />
        </PageContent>
    );
});
