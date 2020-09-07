import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import config from 'src/commons/config-hoc';
import { useGet } from 'src/commons/ajax';

export default config({})((props) => {
    const { exclude = [], ...others } = props;
    const [ options, setOptions ] = useState([]);
    const [ , fetchTeams ] = useGet('/teams');

    useEffect(() => {
        (async () => {
            const rows = await fetchTeams();
            const options = rows.filter(item => !exclude.includes(item.id))
                .map(item => {
                    const { id, name } = item;

                    return {
                        value: id,
                        label: name,
                    };
                });

            setOptions(options);
        })();
    }, []);
    return (
        <Select
            showSearch
            optionFilterProp="label"
            options={options}
            placeholder="请选择团队"
            {...others}
        />
    );
});
