// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { useEffect, useState } from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import { getLoginUser } from '@/commons';
import { UserAvatar } from 'src/library/components';

const rootCss = css`
    padding: 30px;
    margin: 0;
`;

const userCss = css`
    display: flex;
    align-items: center;
    margin-top: 16px;
`;

const avatarCss = css`
    flex: 0 0 72px;
    height: 72px;
    margin-right: 32px;
`;

export default config({})(props => {
    const [ loginUser, setLoginUser ] = useState({});
    useEffect(() => {
        setLoginUser(getLoginUser || {});
    }, []);
    return (
        <PageContent css={rootCss}>
            <h2>工作台</h2>
            <div css={userCss}>
                <UserAvatar css={avatarCss} src={loginUser.avatar}/>

                <div>
                    <h3>您好，{loginUser.name}，祝您工作顺利！</h3>
                    <div>
                        {loginUser.position}
                    </div>
                </div>
            </div>
        </PageContent>
    );
});
