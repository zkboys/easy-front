import React from 'react';
import PropTypes from 'prop-types';
import { FormElement } from 'src/library/components';
import { httpMethodOptions } from 'src/commons';
import Help from 'src/components/help';
import './PathInputStyle.less';
import _ from 'lodash';
import { useGet } from '@/commons/ajax';

const PathInput = props => {
    const { form, formProps, projectId, onBlur, isEdit, id } = props;
    const [ , fetchApiByMethodPath ] = useGet('/projects/:projectId/byMethodPath');
    // 检测path
    const checkMethodPath = _.debounce(async (rule, path, callback) => {
        if (!path) return callback();

        const method = form.getFieldValue('method');

        const api = await fetchApiByMethodPath({ projectId, method, path });

        if (!api) return callback();

        if ((isEdit && api.id !== id) || !isEdit) return callback(`与接口「${api.name}」地址「${api.path}」冲突`);

        return callback();
    }, 300);
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
                onChange={() => {
                    form.validateFields([ 'path' ]);
                }}
            />
            <FormElement
                style={{ flex: 1 }}
                name="path"
                label="接口地址"
                labelWidth={0}
                colon={false}
                required
                placeholder="/path"
                onBlur={onBlur}
                nospace
                rules={[
                    { validator: checkMethodPath },
                    {
                        validator: (rule, value) => {
                            if (!value) return Promise.resolve();

                            if (value.trim().includes(' ')) return Promise.reject('地址不合法！');

                            return Promise.resolve();
                        },
                    },
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
