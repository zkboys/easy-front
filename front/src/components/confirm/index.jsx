import React from 'react';
import { Modal } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

export default async (title, content) => {

    return new Promise((resolve, reject) => {
        Modal.confirm({
            icon: <QuestionCircleOutlined/>,
            title,
            content: <div style={{ marginTop: 8, fontSize: 14, color: 'red' }}>{content}</div>,
            onOk: () => resolve(),
            onCancel: () => reject('取消确认'),
        });
    });
}
