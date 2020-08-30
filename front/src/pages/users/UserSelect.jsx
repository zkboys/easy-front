import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import config from 'src/commons/config-hoc';
import { useGet } from '@/commons/ajax';

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

                    return {
                        value: id,
                        label: `${name}(${account})`,
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
            {...others}
        />
    );
});
