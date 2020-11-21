import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import config from 'src/commons/config-hoc';
import { useGet } from 'src/commons/ajax';

export default config({})((props) => {
    const { exclude = [], teamId, onChange, onLoad, ...others } = props;
    const [ options, setOptions ] = useState([]);
    const [ , fetchHotBlockFiles ] = useGet(`/teams/${teamId}/hotBlockFiles`);

    useEffect(() => {
        (async () => {
            const { rows } = await fetchHotBlockFiles();
            const options = rows.filter(item => !exclude.includes(item.id))
                .map(item => {
                    const { id, description, name } = item;

                    return {
                        ...item,
                        value: id,
                        label: `${name} - ${description}`,
                    };
                });

            setOptions(options);
            onLoad(options);
        })();
    }, []);
    return (
        <Select
            allowClear
            showSearch
            optionFilterProp="label"
            options={options}
            onChange={value => {
                const record = options.find(item => item.value === value);
                onChange(value, record);
            }}
            {...others}
        />
    );
});
