import React, { Component } from 'react';
import { Form } from 'antd';
import config from 'src/commons/config-hoc';
import { FormElement, ModalContent } from 'src/library/components';
import PageContent from 'src/layouts/page-content';

@config({
    ajax: true,
    connect: state => ({ loginUser: state.system.loginUser }),
    modal: {
        title: '修改密码',
        width: 420,
        centered: true,
    },
})
export default class ModifyPassword extends Component {
    state = {
        loading: false,
    };

    handleOk = (values) => {
        if (this.state.loading) return;
        const { onOk } = this.props;

        this.setState({ loading: true });
        this.props.ajax.put('/updatePassword', values)
            .then(() => {
                if (onOk) onOk();
            })
            .finally(() => this.setState({ loading: false }));
    };

    handleCancel = () => {
        const { onCancel } = this.props;
        if (onCancel) onCancel();
    };

    render() {
        const { loading } = this.state;
        const labelWidth = 100;

        return (
            <ModalContent
                loading={loading}
                surplusSpace={false}
                onOk={() => this.form.submit()}
                onCancel={this.handleCancel}
            >
                <PageContent>
                    <Form ref={form => this.form = form} onFinish={this.handleOk}>
                        <FormElement
                            label="原密码"
                            labelWidth={labelWidth}
                            type="password"
                            name="oldPassword"
                            required
                            autoFocus
                        />
                        <FormElement
                            label="新密码"
                            labelWidth={labelWidth}
                            type="password"
                            name="password"
                            required
                        />
                        <FormElement
                            label="确认密码"
                            labelWidth={labelWidth}
                            type="password"
                            name="rePassword"
                            dependencies={[ 'password' ]}
                            required
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(rule, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject('新密码与确认新密码不同！');
                                    },
                                }),
                            ]}
                        />
                    </Form>
                </PageContent>
            </ModalContent>
        );
    }
}

