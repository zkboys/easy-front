import React from 'react';
import PropTypes from 'prop-types';
import { UserAvatar } from 'src/library/components';
import { Link } from 'react-router-dom';

const UserLink = props => {
    let { user, size, showAvatar, link } = props;
    if (!user) user = { name: '未知用户' };

    const children = (
        <>
            {showAvatar ? <UserAvatar src={user?.avatar} name={user?.name} size={size}/> : null}
            <span style={{ marginLeft: 8 }}>{user?.name}</span>
        </>
    );

    if (link) {
        return (
            <Link to={`/users/${user?.id}/project`}>
                {children}
            </Link>
        );
    }

    return children;

};

UserLink.propTypes = {
    user: PropTypes.object,
    size: PropTypes.any,
    showAvatar: PropTypes.bool,
    link: PropTypes.bool,
};

UserLink.defaultProps = {
    showAvatar: true,
    link: true,
};

export default UserLink;
