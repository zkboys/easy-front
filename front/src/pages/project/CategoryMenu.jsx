import React, { useState, useEffect } from 'react';
import { Menu, Tooltip } from 'antd';
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
import CategoryModal from './CategoryModal';
import './style.less';

export default config({})(props => {
    const { selectKey, onClick, onChange, projectId, project, isProjectMaster } = props;

    const [ dataSource, setDataSource ] = useState([]);
    const [ visible, setVisible ] = useState(false);
    const [ editId, setEditId ] = useState(null);
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


    useEffect(() => {
        (async () => {
            await fetchDataSource();
        })();
    }, [ projectId, project ]);

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
                selectedKeys={[ selectKey ]}
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

                                                        setEditId(id);
                                                        setVisible(true);
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
                            <Menu.Item key={'123'}><ApiOutlined/> {'123123'}</Menu.Item>
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
            <CategoryModal
                visible={visible}
                isEdit={!!editId}
                id={editId}
                projectId={projectId}
                onOk={() => {
                    setVisible(false);
                    onChange && onChange('edit');
                }}
                onCancel={() => setVisible(false)}
            />
        </PageContent>
    );
});


