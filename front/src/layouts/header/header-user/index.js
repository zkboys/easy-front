import React, { Component } from 'react';
import {
    CaretDownOutlined,
    EditOutlined,
    LogoutOutlined,
    // UserOutlined,
} from '@ant-design/icons';
import { Menu, Dropdown } from 'antd';
// import { Link } from 'react-router-dom';
import { toLogin, getLoginUser } from 'src/commons';
import ModifyPassword from './ModifyPassword';
import config from 'src/commons/config-hoc';
import defaultAvatar from './default_avatar.jpeg';
import './style.less';

const Item = Menu.Item;

@config({ ajax: true })
export default class HeaderUser extends Component {
    static defaultProps = {
        theme: 'default',
    };

    state = {
        passwordVisible: false,
    };

    handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            this.props.ajax.post('/logout')
                .then(toLogin);
        }

        if (key === 'modifyPassword') {
            this.setState({ passwordVisible: true });
        }
    };

    render() {
        const user = getLoginUser() || {};
        let { name, avatar } = user;

        avatar = avatar || defaultAvatar;

        const { className, theme } = this.props;

        const menu = (
            <Menu styleName="menu" theme={theme} selectedKeys={[]} onClick={this.handleMenuClick}>
                <Item key="modifyPassword"><EditOutlined/>修改密码</Item>
                {/*<Item><Link to="/user-center"><UserOutlined/>个人中心</Link></Item>*/}
                <Menu.Divider/>
                <Item key="logout"><LogoutOutlined/>退出登录</Item>
            </Menu>
        );
        return (
            <div styleName="user-menu" ref={node => this.userMenu = node}>
                <Dropdown trigger="click" overlay={menu} getPopupContainer={() => (this.userMenu || document.body)}>
                    <span styleName="account" className={className}>
                        <img styleName="avatar" src={avatar} alt="头像"/>
                        <span styleName="user-name">{name}</span>
                        <CaretDownOutlined/>
                    </span>
                </Dropdown>

                <ModifyPassword
                    visible={this.state.passwordVisible}
                    onOk={() => this.setState({ passwordVisible: false }, () => toLogin())}
                    onCancel={() => this.setState({ passwordVisible: false })}
                />
            </div>
        );
    }
}
