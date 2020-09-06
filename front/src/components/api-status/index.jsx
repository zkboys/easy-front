import React from 'react';
import PropTypes from 'prop-types';
import { apiStatusOptions } from 'src/commons';

const ApiStatus = props => {
    const { status } = props;
    const option = apiStatusOptions.find(item => item.value === status);
    const label = option?.label || status;
    const color = option?.color || 'grey';

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                marginRight: 4,
                borderRadius: '50%',
                backgroundColor: color,
            }}/>
            <span>{label}</span>
        </span>
    );
};

ApiStatus.propTypes = {
    status: PropTypes.string,
};

export default ApiStatus;
