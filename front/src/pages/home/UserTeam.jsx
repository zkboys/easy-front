// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'antd';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import { useGet } from '@/commons/ajax';


const rootCss = css`
  padding: 0;
  margin: 0;
  background: none;
`;

const teamCss = css`
  div {
    color: #000;
    font-weight: bold;
  }
  p {
    color: #999;
  }
`;


export default config()(props => {
    const [ teams, setTeams ] = useState([]);

    const [ teamsLoading, fetchTeams ] = useGet('/teams');

    useEffect(() => {
        (async () => {
            const teams = await fetchTeams();
            setTeams(teams);
            console.log(teams);
        })();
    }, []);

    return (
        <PageContent css={rootCss} loading={teamsLoading}>
            <Card title="我的团队" extra={<Link to="/teams/:teamId/:tabId">更多</Link>} style={{ width: 300 }}>
                {teams.map(item => {
                    const { id, name, description } = item;

                    return (
                        <div css={teamCss}>
                            <Link to={`/teams/${id}/:tabId`}>
                                <div>{name}</div>
                            </Link>

                            <p>{description}</p>
                        </div>
                    );
                })}
            </Card>
        </PageContent>
    );
});
