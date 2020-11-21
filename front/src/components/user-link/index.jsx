import React from 'react';
import PropTypes from 'prop-types';
import { UserAvatar } from 'src/library/components';
import { Link } from 'react-router-dom';

const UserLink = props => {
    const { user , size} = props;
    return (
        <Link to={`/users/${user?.id}/project`}>
            <UserAvatar src={user?.avatar} name={user?.name} size={size}/>
            <span style={{ marginLeft: 8 }}>{user?.name}</span>
        </Link>
    );
};

UserLink.propTypes = {
    user: PropTypes.object,
    size: PropTypes.any,
};

export default UserLink;
