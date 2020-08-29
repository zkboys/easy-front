import React, { useEffect, useState } from 'react';
import { Upload, message, Tooltip, notification, Button } from 'antd';
import config from 'src/commons/config-hoc';
import { setLoginUser } from 'src/commons';
import PageContent from 'src/layouts/page-content';
import './style.less';
import { useGet } from 'src/commons/ajax';
import ModifyPassword from 'src/layouts/header/header-user/ModifyPassword';
import defaultAvatar from './default_avatar.jpeg';

function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('值支持jpeg 或 png格式');
    }
    const isLt2M = file.size / 1024 < 200;
    if (!isLt2M) {
        message.error('图片大小不能超过2KB');
    }
    return isJpgOrPng && isLt2M;
}

export default config({
    path: '/user-center',
    title: { text: '个人中心', icon: 'user' },
    breadcrumbs: [
        {
            key: '1',
            path: '/',
            text: '首页',
            icon: 'home',
        },
        {
            key: '2',
            path: '/user-center',
            text: '个人中心',
            icon: 'user',
        },
    ],
})(props => {
    const [ loading, fetchUser ] = useGet('/users/:id');
    const [ user, setUser ] = useState({});
    const [ uploading, setUploading ] = useState(false);
    const [ visible, setVisible ] = useState(false);

    const { id: userId } = props.user;

    const getUser = async () => {
        const user = await fetchUser(userId);
        setUser(user);
        setLoginUser(user);
    };

    const handleChange = async info => {
        if (info.file.status === 'uploading') {
            setUploading(true);
            return;
        }
        if (info.file.status === 'done') {
            setUploading(false);
            await getUser();
        }
        if (info.file.status === 'error') {
            notification.error({
                message: '失败',
                description: '上传失败！',
                duration: 2,
            });
            setUploading(false);
        }
    };

    useEffect(() => {
        (async () => {
            await getUser();
        })();
    }, []);

    const avatar = user.avatar || defaultAvatar;
    return (
        <PageContent styleName="root" loading={loading || uploading}>
            <div styleName="content">
                <Upload
                    name="avatar"
                    showUploadList={false}
                    action="/api/uploadUserAvatar"
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                >
                    <Tooltip placement="right" title="点击上传头像，支持 jpg、png格式，大小2M以内，长宽比1:1效果最佳">
                        <img styleName="avatar" src={avatar} alt="头像"/>
                    </Tooltip>
                </Upload>

                <div styleName="item">
                    <div styleName="label">
                        账号
                    </div>
                    <div styleName="value">
                        {user.account}
                    </div>
                </div>

                <div styleName="item">
                    <div styleName="label">
                        昵称
                    </div>
                    <div styleName="value">
                        {user.name}
                    </div>
                </div>

                <div styleName="item">
                    <div styleName="label">
                        邮箱
                    </div>
                    <div styleName="value">
                        {user.email}
                    </div>
                </div>
                <div styleName="item">
                    <div styleName="label">
                    </div>
                    <div styleName="value">
                        <Button danger onClick={() => setVisible(true)}> 修改密码</Button>
                    </div>
                </div>
            </div>
            <ModifyPassword
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
            />
        </PageContent>
    );
});
