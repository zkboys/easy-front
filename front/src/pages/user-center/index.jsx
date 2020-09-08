import React, { useEffect, useState } from 'react';
import { Upload, message, Tooltip, notification, Tabs, Empty } from 'antd';
import { AppstoreOutlined, SolutionOutlined } from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import { useGet } from 'src/commons/ajax';
import TabPage from 'src/components/tab-page';
import defaultAvatar from './default_avatar.jpeg';
import { getColor } from 'src/commons';
import Project from './Project';
import Dynamic from 'src/components/dynamic';

import './style.less';

const { TabPane } = Tabs;

function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('值支持jpeg 或 png格式');
    }
    const isLt2M = file.size / 1024 < 200;
    if (!isLt2M) {
        message.error('图片大小不能超过200KB');
    }
    return isJpgOrPng && isLt2M;
}

export default config({
    path: '/users/:id/:tabId',
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
    const { params } = props.match;
    const [ loading, fetchUser ] = useGet('/users/:id');
    const [ activeKey, setActiveKey ] = useState(params.tabId === ':tabId' ? 'project' : params.tabId);
    const [ user, setUser ] = useState({});
    const [ uploading, setUploading ] = useState(false);

    const { id: userId } = params;
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

    // 组件加载完成
    useEffect(() => {
        (async () => {
            await getUser();
        })();
    }, []);

    // 改变浏览器地址
    useEffect((aaa) => {
        props.history.replace(`/users/${userId}/${activeKey}`);
    }, [ userId, activeKey ]);

    // teamId改变 获取 team详情
    const avatar = user.avatar || defaultAvatar;

    const color = getColor(user.name);
    if (!user.id) return (
        <Empty
            style={{ marginTop: 100 }}
            description="此人员不存在或已被删除"
        />
    );
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
                                accept="image/png, image/jpeg"
                                name="avatar"
                                showUploadList={false}
                                action="/api/uploadUserAvatar"
                                beforeUpload={beforeUpload}
                                onChange={handleChange}
                            >
                                <Tooltip placement="right" title="点击上传头像，支持 jpg、png格式，大小200K以内，长宽比1:1效果最佳">
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
                </div>
            )}
        >
            <TabPane tab={<span><AppstoreOutlined/> 个人项目</span>} key="project">
                <Project userId={userId}/>
            </TabPane>
            <TabPane tab={<span><SolutionOutlined/> 个人动态</span>} key="dynamic">
                <div className="pan-content">
                    <Dynamic showUser={false} showTeam showProject url={`/users/${userId}/dynamics`}/>
                </div>
            </TabPane>
        </TabPage>
    );
});
