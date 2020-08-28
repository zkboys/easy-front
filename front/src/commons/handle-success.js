import { message } from 'antd';

export default function handleSuccess({ successTip }) {
    successTip && message.success(successTip);
}
