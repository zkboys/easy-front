import React, { useEffect, useState } from 'react';
import { Button, Form } from 'antd';

import PageContent from 'src/layouts/page-content';
import config from 'src/commons/config-hoc';
import { useGet, useDel } from 'src/commons/ajax';
import {
    FormElement,
    FormRow,
    Operator,
    Pagination,
    QueryBar,
    Table,
} from 'src/library/components';

import EditModal from './EditModal';
import { RollbackOutlined } from '@ant-design/icons';
import UserLink from '@/components/user-link';

export default config({
    path: '/teams/:teamId/resource/hot-block-file',
})((props) => {
    const { match: { params: { teamId } } } = props;

    // 数据定义
    const [ { condition, pageSize, pageNum }, setCondition ] = useState({ condition: {}, pageSize: 20, pageNum: 1 });
    const [ dataSource, setDataSource ] = useState([]);
    const [ total, setTotal ] = useState(0);
    const [ visible, setVisible ] = useState(false);
    const [ id, setId ] = useState(null);
    const [ form ] = Form.useForm();

    // 请求相关定义 只是定义，不会触发请求，调用相关函数，才会触发请求
    const [ loading, fetchHotBlockFiles ] = useGet(`/teams/${teamId}/hotBlockFiles`);
    const [ deletingOne, deleteHotBlockFile ] = useDel(`/teams/${teamId}/hotBlockFiles/:id`, { successTip: '删除成功！' });

    const columns = [
        { title: '文件名称', dataIndex: 'name', width: 200 },
        {
            title: '文件地址', dataIndex: 'url', width: 400,
            render: value => {
                if (!value) return null;

                return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>;
            },
        },
        { title: '文件描述', dataIndex: 'description' },
        {
            title: '创建者', dataIndex: 'user', width: 150,
            render: value => {
                return <UserLink user={value} size="small"/>;
            },
        },
        {
            title: '操作', dataIndex: 'operator', width: 100,
            render: (value, record) => {
                const { id, name } = record;

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

    // 列表查询
    async function handleSearch() {
        if (loading) return;
        const params = {
            ...condition,
            pageNum,
            pageSize,
        };

        const res = await fetchHotBlockFiles(params);

        setDataSource(res?.rows || []);
        setTotal(res?.count || 0);
    }

    // 单个删除
    async function handleDelete(id) {
        if (deletingOne) return;

        await deleteHotBlockFile(id);
        await handleSearch();
    }

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

    // jsx 用到的数据
    const formProps = { width: 200 };
    const pageLoading = loading
        || deletingOne;

    return (
        <PageContent loading={pageLoading}>
            <QueryBar>
                <Form name="user-query" form={form} onFinish={condition => setCondition({ condition, pageSize, pageNum: 1 })}>
                    <FormRow>
                        <Button
                            style={{ marginLeft: 8 }}
                            icon={<RollbackOutlined/>}
                            onClick={() => props.history.goBack()}
                        >
                            返回团队
                        </Button>
                        <FormElement
                            {...formProps}
                            width={300}
                            label="名称/地址/描述"
                            name="keyWord"
                        />
                        <FormElement layout>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={() => form.resetFields()}>重置</Button>
                            <Button type="primary" onClick={() => setVisible(true) || setId(null)}>添加</Button>
                        </FormElement>
                    </FormRow>
                </Form>
            </QueryBar>
            <Table
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
                teamId={teamId}
                isEdit={id !== null}
                onOk={() => setVisible(false) || handleSearch()}
                onCancel={() => setVisible(false)}
            />
        </PageContent>
    );
});
