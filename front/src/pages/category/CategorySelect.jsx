import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import config from 'src/commons/config-hoc';
import { useGet } from '@/commons/ajax';

export default config({})((props) => {
    const { exclude = [], projectId, ...others } = props;
    const [ options, setOptions ] = useState([]);
    const [ , fetchCategories ] = useGet('/projects/:projectId/categories');

    useEffect(() => {
        if (!projectId) return;
        (async () => {
            const rows = await fetchCategories(projectId);
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
            placeholder="请选择分类"
            {...others}
        />
    );
});
