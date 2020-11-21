import React, { useState } from 'react';
import { Tooltip, Image } from 'antd';
import { Link } from 'react-router-dom';
import { FormOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import { getColor } from 'src/commons';
import ImagePageModal from './ImagePageModal';
import './ImagePageItem.less';
import confirm from '@/components/confirm';
import { useDel } from '@/commons/ajax';
import UserLink from '@/components/user-link';

export default config({})(props => {
    const { data = {}, onChange } = props;
    const { id, name, src, description, team = {} } = data;
    console.log(data);

    const [ visible, setVisible ] = useState(false);

    const [ deleting, deleteImagePage ] = useDel('/teams/:teamId/imagePages/:id', { successTip: '删除成功！' });

    const handleDelete = async () => {
        if (deleting) return;
        await deleteImagePage(id);
        onChange();
    };

    const color = getColor(data.name);

    return (
        <div styleName="root">
            <div styleName="content" style={{ backgroundColor: color }}>
                <div styleName="operator">
                    <Tooltip title="修改页面">
                        <FormOutlined onClick={() => setVisible(true)}/>
                    </Tooltip>
                    <Tooltip title="删除页面">
                        <DeleteOutlined
                            disabled={deleting}
                            onClick={async () => {
                                await confirm({
                                    title: `您确定要删除页面「${name}」吗?`,
                                    content: `「${name}」页面将无法访问，请谨慎操作！`,
                                });
                                await handleDelete();
                            }}/>
                    </Tooltip>
                </div>

                <div styleName="image-wrap">
                    <div>
                        <Image
                            styleName="image"
                            src={src}
                        />
                    </div>
                </div>


                <div styleName="title">
                    <Link to={`/teams/${team.id}/image-page/${id}`}>{name}</Link>
                </div>
                <div styleName="description">
                    {description}
                </div>
            </div>

            <div styleName="footer" style={{ borderColor: color }}>
                <Link to={`/teams/${team.id}/image-page`}>
                    <TeamOutlined/>{team.name}
                </Link>
                <UserLink user={data.user} size="small"/>
            </div>
            <ImagePageModal
                visible={visible}
                id={id}
                isEdit={!!id}
                teamId={team.id}
                onOk={async (data) => {
                    setVisible(false);
                    onChange(data);
                }}
                onCancel={() => setVisible(false)}
            />
        </div>
    );
});


