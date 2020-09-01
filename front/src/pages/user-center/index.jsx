import React, { useEffect, useState } from 'react';
import { Upload, message, Tooltip, notification, Button } from 'antd';
import config from 'src/commons/config-hoc';
import './style.less';
import { useGet } from 'src/commons/ajax';
import TabPage from 'src/components/tab-page';
import defaultAvatar from './default_avatar.jpeg';
import { getColor } from '@/commons';
import Dynamic from './Dynamic';
import Project from './Project';

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
    path: '/users/:id',
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
    const [ activeKey, setActiveKey ] = useState('dynamic');
    const [ user, setUser ] = useState({});
    const [ uploading, setUploading ] = useState(false);

    const { id: userId } = props.match.params;
    const isSelf = userId === props.user.id;

    const getUser = async () => {
        const user = await fetchUser(userId);
        setUser(user);
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

    const color = getColor(user.name);
    return (
        <TabPage
            loading={loading || uploading}
            activeKey={activeKey}
            onChange={key => setActiveKey(key)}
            detailStyle={{ backgroundColor: color }}
            detail={(
                <div styleName="content">
                    <div styleName="avatar-box">
                        {isSelf ? (
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
                        ) : (
                            <img style={{ cursor: 'default' }} styleName="avatar" src={avatar} alt="头像"/>
                        )}
                    </div>
                    <div styleName="detail-box">
                        <h1>{user.name}</h1>
                        <div styleName="item" style={{ margin: '8px 0 0 0' }}>
                            <div styleName="label">账号：</div>
                            <div styleName="value">
                                {user.account}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            list={(
                <div>
                    <div styleName="item">
                        <div styleName="label">邮箱：</div>
                        <div styleName="value">
                            {user.email}
                        </div>
                    </div>

                    <div styleName="item">
                        <div styleName="label">部门：</div>
                        <div styleName="value">
                            {user.departments?.map(item => item.name).join()}
                        </div>
                    </div>
                    <div styleName="item">
                        <div styleName="label">职位：</div>
                        <div styleName="value">
                            {user.position}
                        </div>
                    </div>

                    <div style={{ height: 1000, width: 100, background: 'green' }}/>
                </div>
            )}
            tabs={[
                {
                    key: 'dynamic', title: '动态',
                    content: props => <Dynamic userId={userId} {...props}/>,
                },
                {
                    key: 'project', title: '我的项目',
                    content: props => <Project userId={userId} {...props}/>,
                },
            ]}
        />
    );
});
