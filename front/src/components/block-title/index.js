import React from 'react';
import PropTypes from 'prop-types';
import './style.less';

const BlockTitle = props => {
    const { styleName = '', className = '', ...others } = props;
    return (
        <h2
            styleName={`title ${styleName}`}
            className={`block-title ${className}`}
            {...others}
        >
            {props.children}
        </h2>
    );
};

BlockTitle.propTypes = {
    styleName: PropTypes.any,
    className: PropTypes.any,
};

export default BlockTitle;
