import React, { useEffect, useState } from 'react';
import { Select, Tag } from 'antd';
import config from 'src/commons/config-hoc';
import { useGet } from 'src/commons/ajax';
import { getColor } from 'src/commons';
import UserLink from '@/components/user-link';

export default config({})((props) => {
    const { exclude = [], ...others } = props;
    const [ options, setOptions ] = useState([]);
    const [ , fetchUsers ] = useGet('/users');

    useEffect(() => {
        (async () => {
            const { rows } = await fetchUsers();
            const options = rows.filter(item => !exclude.includes(item.id))
                .map(item => {
                    const { id, account, name } = item;
                    const user = { ...item, name: `${name}(${account})` };

                    return {
                        value: id,
                        label: <UserLink user={user} size="small" link={false}/>,
                    };
                });

            setOptions(options);
        })();
    }, []);
    return (
        <Select
            allowClear
            showSearch
            optionFilterProp="label"
            options={options}
            tagRender={(props) => {
                const { label, closable, onClose } = props;
                const name = label?.props?.user?.name;
                const color = getColor(name);

                return (
                    <Tag
                        color={color}
                        closable={closable}
                        onClose={onClose}
                        style={{ marginRight: 3 }}
                    >
                        {label}
                    </Tag>
                );
            }}
            {...others}
        />
    );
});
