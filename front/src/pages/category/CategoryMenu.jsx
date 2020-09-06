import React, { useState, useEffect } from 'react';
import { Button, Empty, Menu, Tooltip } from 'antd';
import config from 'src/commons/config-hoc';
import { useDel, useGet } from 'src/commons/ajax';
import {
    ApiOutlined,
    FolderOpenOutlined,
    FormOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import PageContent from 'src/layouts/page-content';
import confirm from 'src/components/confirm';
import './CategoryMenuStyle.less';

export default config({})(props => {
    const {
        selectedKey,
        onClick,
        onChange,
        projectId,
        project,
        isProjectMaster,
        showModal,
        keyWord,
    } = props;

    const [ dataSource, setDataSource ] = useState([]);
    const [ loading, fetchCategories ] = useGet('/projects/:projectId/categories');

    const [ deleting, deleteCategory ] = useDel('/projects/:projectId/categories/:id', { successTip: '删除成功！' });

    async function fetchDataSource() {
        if (loading) return;
        const dataSource = await fetchCategories(projectId);

        setDataSource(dataSource);
    }

    async function handleDelete(id, name) {
        await confirm(`您确定要删除分类「${name}」吗?`, `「${name}」分类下的所有接口等信息也将被删除，请谨慎操作！`);

        await deleteCategory({ projectId, id });

        onChange && onChange('delete');
    }

    // 关键字改变，进行过滤
    useEffect(() => {
        dataSource.forEach(item => {
            const { name, apis } = item;

            if (!keyWord) {
                item._hide = false;
                apis.forEach(it => it._hide = false);
                return;
            }

            item._hide = !name?.includes(keyWord);

            apis.forEach(it => it._hide = !it.name.includes(keyWord));
            const isAllHide = apis.every(it => it._hide);

            // 如果不是api全部隐藏，要显示父级分类
            if (!isAllHide) item._hide = false;
        });
        setDataSource([ ...dataSource ]);
    }, [ keyWord ]);

    useEffect(() => {
        (async () => {
            await fetchDataSource();
        })();
    }, [ projectId, project ]);

    const showDataSource = dataSource.filter(item => !item._hide);
    if (!showDataSource?.length) return (
        <Empty
            style={{ marginTop: 100 }}
            description={dataSource?.length ? '无匹配结果' : '暂无任何分类'}
        >
            {dataSource?.length ? null : (
                <Button
                    type="primary"
                    onClick={() => {
                        showModal && showModal();
                    }}
                >
                    <FolderOpenOutlined/>创建分类
                </Button>
            )}
        </Empty>
    );
    return (
        <PageContent
            styleName="category-menu"
            style={{ padding: 0, margin: 0 }}
            loading={
                loading ||
                deleting
            }>
            <Menu
                onClick={({ key }) => onClick(key, 'api')}
                style={{ width: '100%' }}
                selectedKeys={[ `${selectedKey}` || 'all' ]}
                mode="inline"
            >
                <Menu.Item key="all"><ApiOutlined/>所有接口</Menu.Item>
                {dataSource.map(item => {
                    const { id, name, apis } = item;
                    return (
                        <Menu.SubMenu
                            key={id}
                            icon={<FolderOpenOutlined/>}
                            title={(
                                <span styleName="subtitle">
                                    <Tooltip title="点击查看接口列表" placement="top">
                                        <span
                                            onClick={e => {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                onClick(id, 'category');
                                            }}
                                        >
                                            {name}
                                        </span>
                                    </Tooltip>
                                    {isProjectMaster ? (
                                        <div>
                                            <Tooltip title="编辑分类" placement="top">
                                                <FormOutlined
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        e.stopPropagation();

                                                        showModal && showModal(id);
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="删除分类" placement="top">
                                                <DeleteOutlined
                                                    style={{ color: 'red' }}
                                                    onClick={async e => {
                                                        e.preventDefault();
                                                        e.stopPropagation();

                                                        await handleDelete(id, name);
                                                    }}
                                                />
                                            </Tooltip>
                                        </div>
                                    ) : null}
                                </span>
                            )}
                        >
                            {apis.map(it => {
                                const { id, name } = it;

                                return (
                                    <Menu.Item key={id}><ApiOutlined/> {name}</Menu.Item>
                                );
                            })}
                        </Menu.SubMenu>
                    );
                })}
            </Menu>
        </PageContent>
    );
});


