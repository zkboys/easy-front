import React, { useEffect, useState } from 'react';
import config from 'src/commons/config-hoc';
import { useGet } from '@/commons/ajax';
import _ from 'lodash';
import { Button, Empty, Input } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import PageContent from 'src/layouts/page-content';
import ProjectModal from 'src/pages/project/ProjectModal';
import ProjectItem from '@/pages/project/ProjectItem';

export default config()(props => {
    const { height, teamId, teams } = props;
    const [ projects, setProjects ] = useState([]);
    const [ projectVisible, setProjectVisible ] = useState(false);

    const [ projectLoading, fetchProjects ] = useGet('/projects');


    async function getProjects() {
        const projects = await fetchProjects({ teamId });
        setProjects(projects);
    }

    // 搜索项目
    const handleSearchProject = _.debounce((e) => {
        // 获取不到e.target
        const input = document.getElementById('search-project');
        const value = input.value;
        projects.forEach(item => {
            const { name } = item;

            if (!value) return item._hide = false;

            item._hide = !name?.includes(value);
        });
        setProjects([ ...projects ]);
    }, 100);

    useEffect(() => {
        (async () => {
            await getProjects();
        })();
    }, [ teamId ]);

    const showProjects = projects.filter(item => !item._hide);
    return (
        <PageContent style={{ padding: 0, margin: 0 }} loading={projectLoading}>
            <div className="pan-operator">
                <span style={{ flex: 1, marginLeft: 0 }}>
                    当前团队共{projects.length}个项目
                </span>
                <Input
                    id="search-project"
                    allowClear
                    style={{ width: 200, height: 28 }}
                    placeholder="输入项目名称进行搜索"
                    onChange={handleSearchProject}
                />
                {teams?.length ? (
                    <Button
                        type="primary"
                        style={{ marginLeft: 8 }}
                        onClick={() => setProjectVisible(true)}
                    >
                        <AppstoreAddOutlined/> 创建项目
                    </Button>
                ) : null}
            </div>
            <div className="pan-content" style={{height}}>
                {showProjects?.length ? (
                    <div style={{ display: 'flex', flexFlow: 'wrap' }}>
                        {showProjects.map(project => (
                            <ProjectItem
                                key={project.id}
                                data={project}
                                onEdit={data => {
                                    Object.entries(data).forEach(([ key, value ]) => {
                                        if (key in project) project[key] = value;
                                    });
                                    setProjects([ ...projects ]);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <Empty
                        style={{ marginTop: 100 }}
                        description={projects?.length ? '无匹配项目' : '您未加入任何团队项目'}
                    >
                        {projects?.length || !teams?.length ? null : <Button type="primary" onClick={() => setProjectVisible(true)}> <AppstoreAddOutlined/> 创建项目</Button>}
                    </Empty>
                )}
            </div>
            <ProjectModal
                visible={projectVisible}
                teamId={teamId}
                teams={teams}
                disabledTeam
                onOk={async () => {
                    setProjectVisible(false);
                    await getProjects();
                }}
                onCancel={() => setProjectVisible(false)}
            />
        </PageContent>
    );
});
