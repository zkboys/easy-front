import React from 'react';
import PropTypes from 'prop-types';
import { FormElement } from '@/library/components';
import { httpMethodOptions } from '@/commons';
import Help from 'src/components/help';
import './PathInputStyle.less';

const PathInput = props => {
    const { formProps } = props;
    return (
        <div styleName="api-path-input">
            <FormElement
                {...formProps}
                style={{ flex: '0 0 200px' }}
                type="select"
                label={<span><Help type="httpPath"/>接口地址</span>}
                name="method"
                required
                options={httpMethodOptions}
                placeholder="请选择方法"
            />
            <FormElement
                style={{ flex: 1 }}
                name="path"
                label="接口地址"
                labelWidth={0}
                colon={false}
                required
                placeholder="/path"
                rules={[
                    {
                        validator: (rule, value) => {
                            if (value && !value.startsWith('/')) return Promise.reject('接口地址需要以 / 开头！');

                            return Promise.resolve();
                        },
                    },
                ]}
            />
        </div>
    );
};

PathInput.propTypes = {
    formProps: PropTypes.object,
};

export default PathInput;
