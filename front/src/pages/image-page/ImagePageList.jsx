import React, { useEffect, useState } from 'react';
import config from 'src/commons/config-hoc';
import { useGet } from 'src/commons/ajax';
import _ from 'lodash';
import { Button, Empty, Input } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import PageContent from 'src/layouts/page-content';
import ImagePageModal from 'src/pages/image-page/ImagePageModal';
import ImagePageItem from 'src/pages/image-page/ImagePageItem';

export default config()(props => {
    const { height, team, onChange } = props;
    const [ imagePages, setImagePages ] = useState([]);
    const [ imagePageVisible, setImagePageVisible ] = useState(false);
    const [ refresh, setRefresh ] = useState({});

    const [ imagePageLoading, fetchImagePages ] = useGet('/teams/:teamId/imagePages');

    const teamId = team?.id;

    const showAdd = !!team;


    async function getImagePages() {
        const imagePages = await fetchImagePages({ teamId });
        setImagePages(imagePages);
    }

    // 搜索页面
    const handleSearchImagePage = _.debounce((e) => {
        const { value } = e.target;
        console.log(value);
        imagePages.forEach(item => {
            const { name } = item;

            if (!value) return item._hide = false;

            item._hide = !name?.includes(value);
        });
        setImagePages([ ...imagePages ]);
    }, 300);

    useEffect(() => {
        if (!teamId) return;
        (async () => {
            await getImagePages();
        })();
    }, [ teamId, refresh ]);

    const showImagePages = imagePages.filter(item => !item._hide);
    return (
        <PageContent style={{ padding: 0, margin: 0 }} loading={imagePageLoading}>
            <div className="pan-operator">
                <span style={{ flex: 1, marginLeft: 0 }}>
                    当前团队共{imagePages.length}个页面
                </span>
                <Input
                    allowClear
                    style={{ width: 200, height: 28 }}
                    placeholder="请输入关键字进行搜索"
                    onChange={e => {
                        e.persist();
                        handleSearchImagePage(e);
                    }}
                />
                {showAdd ? (
                    <Button
                        type="primary"
                        style={{ marginLeft: 8 }}
                        onClick={() => setImagePageVisible(true)}
                    >
                        <AppstoreAddOutlined/> 创建页面
                    </Button>
                ) : null}
            </div>
            <div className="pan-content" style={{ height, padding: 16 }}>
                {showImagePages?.length ? (
                    <div style={{ display: 'flex', flexFlow: 'wrap' }}>
                        {showImagePages.map(imagePage => (
                            <ImagePageItem
                                key={imagePage.id}
                                data={imagePage}
                                onChange={() => {
                                    setRefresh({});
                                    onChange && onChange();
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <Empty
                        style={{ marginTop: 100 }}
                        description={imagePages?.length ? '无匹配页面' : '暂无任何页面'}
                    >
                        {showAdd ? <Button type="primary" onClick={() => setImagePageVisible(true)}> <AppstoreAddOutlined/> 创建页面</Button> : null}
                    </Empty>
                )}
            </div>
            <ImagePageModal
                visible={imagePageVisible}
                teamId={teamId}
                disabledTeam
                onOk={async () => {
                    setImagePageVisible(false);
                    await getImagePages();
                    onChange && onChange();
                }}
                onCancel={() => setImagePageVisible(false)}
            />
        </PageContent>
    );
});
