import React, { useState, useEffect } from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import { Table } from 'src/library/components';
import { useGet } from '@/commons/ajax';
import { Button, Empty, Input } from 'antd';
import { ApiOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import _ from 'lodash';

export default config()(props => {
    const { categoryId = 'all', project } = props;
    const [ dataSource, setDataSource ] = useState([]);
    const [ apiVisible, setApiVisible ] = useState(false);
    const [ category, setCategory ] = useState({});

    const [ categoryLoading, fetchCategory ] = useGet('/projects/:projectId/categories/:id');
    const [ loading, fetchApis ] = useGet('/projects/:projectId/categories/:categoryId/apis');
    const [ allLoading, fetchAllApis ] = useGet('/projects/:projectId/apis');

    const projectId = project?.id;
    const isAll = categoryId === 'all';

    const columns = [
        { title: '接口名称', dataIndex: 'name' },
        { title: '接口路径', dataIndex: 'path' },
        { title: '接口分类', dataIndex: 'category' },
        { title: '状态', dataIndex: 'status' },
        { title: '标签', dataIndex: 'tag' },
    ];

    const handleSearchApi = _.debounce((e) => {
        // 获取不到e.target
        const input = document.getElementById('search-api');
        const value = input.value;
        dataSource.forEach(item => {
            const { name, path, category, tag } = item;

            if (!value) return item._hide = false;

            item._hide = !name?.includes(value) && !path.includes(value) && !category?.name?.includes(value) && !tag?.includes(value);
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
        <PageContent style={{ margin: 0, padding: 0 }} loading={loading || allLoading}>
            <div className="pan-operator">
                <span style={{ flex: 1, marginLeft: 0 }}>
                    当前{isAll ? `项目「${project.name}」` : `分类「${category.name}」`}共{dataSource.length}个接口
                </span>
                <Input
                    id="search-api"
                    allowClear
                    style={{ width: 200, height: 28 }}
                    placeholder="输入项目名称进行搜索"
                    onChange={handleSearchApi}
                />
                <Button
                    type="primary"
                    style={{ marginLeft: 8 }}
                    onClick={() => setApiVisible(true)}
                >
                    <ApiOutlined/> 创建接口
                </Button>
            </div>
            <div className="pan-content">
                {dataSource?.length ? (
                    <Table
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
                            onClick={() => setApiVisible(true)}
                        >
                            <ApiOutlined/> 创建接口
                        </Button>
                    </Empty>
                )}
            </div>
        </PageContent>
    );
});
