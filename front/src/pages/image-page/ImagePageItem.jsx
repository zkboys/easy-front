import React, { useState } from 'react';
import { Tooltip, Image } from 'antd';
import { Link } from 'react-router-dom';
import { FormOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import { getColor } from 'src/commons';
import RoleTag from 'src/components/role-tag';
import ImagePageModal from './ImagePageModal';
import './ImagePageItem.less';
import confirm from '@/components/confirm';
import { useDel } from '@/commons/ajax';

export default config({})(props => {
    const { data = {}, onChange, user } = props;
    const { id, name, url, description, team = {}, users = [] } = data;

    const [ visible, setVisible ] = useState(false);

    const [ deleting, deleteImagePage ] = useDel('/teams/:teamId/imagePages/:id', { successTip: '删除成功！' });

    const handleDelete = async () => {
        if (deleting) return;
        await deleteImagePage(id);
        onChange();
    };

    const color = getColor(data.name);
    const role = users.find(item => item.id === user.id)?.imagePageUser?.role;
    const isMaster = user.isAdmin || [ 'owner', 'master' ].includes(role);

    return (
        <div styleName="root">
            <div styleName="content" style={{ backgroundColor: color }}>
                <div styleName="operator">
                    {isMaster ? (
                        <>
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
                        </>
                    ) : null}
                </div>

                <div styleName="image-wrap">
                    <div>
                        <Image
                            styleName="image"
                            src={url}
                        />
                    </div>
                </div>


                <div styleName="title">
                    <Link to={`/image-page/${id}`}>{name}</Link>
                </div>
                <div styleName="description">
                    {description}
                </div>
            </div>

            <div styleName="footer" style={{ borderColor: color }}>
                <Link to={`/teams/${team.id}/imagePage`}>
                    <TeamOutlined/>{team.name}
                </Link>
                <RoleTag role={role}/>
            </div>
            <ImagePageModal
                visible={visible}
                id={id}
                isEdit={!!id}
                teamId={team.id}
                teams={[ team ]}
                disabledTeam
                onOk={async (data) => {
                    setVisible(false);
                    onChange(data);
                }}
                onCancel={() => setVisible(false)}
            />
        </div>
    );
});


