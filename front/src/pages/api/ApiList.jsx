import React, { useState, useEffect } from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import { Table } from 'src/library/components';
import { useGet } from 'src/commons/ajax';
import { Button, Empty, Input } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { httpMethodOptions } from 'src/commons';
import ApiStatus from 'src/components/api-status';

export default config()(props => {
    const { height, categoryId = 'all', projectId, project, onCreateApi, onClick } = props;
    const [ dataSource, setDataSource ] = useState([]);
    const [ category, setCategory ] = useState({});

    const [ categoryLoading, fetchCategory ] = useGet('/projects/:projectId/categories/:id');
    const [ loading, fetchApis ] = useGet('/projects/:projectId/apis');
    const [ allLoading, fetchAllApis ] = useGet('/projects/:projectId/apis');

    const isAll = categoryId === 'all';

    const columns = [
        {
            title: '接口名称', dataIndex: 'name', width: 150,
            render: (value, record) => {
                return (
                    <a onClick={() => onClick(record)}>{value}</a>
                );
            },
        },
        { title: '方法', dataIndex: 'method', width: 80, render: value => httpMethodOptions.find(item => item.value === value)?.label },
        { title: '接口路径', dataIndex: 'path', width: 200 },
        { title: '接口分类', dataIndex: 'category', width: 100, render: value => value?.name },
        { title: '接口描述', dataIndex: 'description' },
        {
            title: '状态', dataIndex: 'status', width: 100, render: value => {
                return <ApiStatus status={value}/>;
            },
        },
        { title: '标签', dataIndex: 'tag', width: 100 },
    ];

    const handleSearchApi = _.debounce((e) => {
        // 获取不到e.target
        const input = document.getElementById('search-api');
        const value = input.value;
        dataSource.forEach(item => {
            const { name, path, category, description, tag } = item;

            if (!value) return item._hide = false;

            item._hide = !name?.includes(value) &&
                !path.includes(value) &&
                !category?.name?.includes(value) &&
                !description?.includes(value) &&
                !tag?.includes(value);
        });

        setDataSource([ ...dataSource ]);
    }, 100);

    useEffect(() => {
        (async () => {
            let category = {};
            if (categoryId && categoryId !== 'all') {
                category = await fetchCategory({ projectId, id: categoryId });
            }
            setCategory(category);
        })();
    }, [ categoryId ]);

    // 获取api列表
    useEffect(() => {
        (async () => {
            if (!projectId || !categoryId) return;
            let dataSource = [];
            if (isAll) {
                dataSource = await fetchAllApis({ projectId });
            } else {
                dataSource = await fetchApis({ projectId, categoryId });
            }
            setDataSource(dataSource);
        })();
    }, [ categoryId, project ]);

    const showDataSource = dataSource.filter(item => !item._hide);

    return (
        <PageContent
            style={{ margin: 0, padding: 0 }}
            loading={
                loading ||
                allLoading ||
                categoryLoading
            }>
            <div className="pan-operator">
                <span style={{ flex: 1, marginLeft: 0 }}>
                    当前{isAll ? `项目「${project.name}」` : `分类「${category.name}」`}共{dataSource.length}个接口
                </span>
                <Input
                    id="search-api"
                    allowClear
                    style={{ width: 200, height: 28 }}
                    placeholder="输入关键字进行搜索"
                    onChange={handleSearchApi}
                />
            </div>
            <div className="pan-content" style={{ height, padding: 16 }}>
                {dataSource?.length ? (
                    <Table
                        offsetHeight={16}
                        columns={columns}
                        dataSource={showDataSource}
                    />
                ) : (
                    <Empty
                        style={{ marginTop: 100 }}
                        description={`${isAll ? '项目' : '分类'}「${isAll ? project.name : category.name}」无任何接口`}
                    >
                        <Button
                            type="primary"
                            onClick={() => onCreateApi()}
                        >
                            <ApiOutlined/> 创建接口
                        </Button>
                    </Empty>
                )}
            </div>
        </PageContent>
    );
});
