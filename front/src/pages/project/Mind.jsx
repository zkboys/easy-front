import React, { useState, useRef, useEffect } from 'react';
import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import './MindStyle.less';
import FullScreen from '@/layouts/header/header-full-screen';

const PUBLIC_URL = process.env.PUBLIC_URL;

export default config()(props => {
    const { projectId, height } = props;

    const rightEl = useRef(null);
    const [ frameHeight, setFrameHeight ] = useState(height - 8);

    const [ mindId, setMindId ] = useState('');
    const [ isFull, setIsFull ] = useState(false);

    console.log(PUBLIC_URL);

    useEffect(() => {
        console.log(isFull);
        setFrameHeight(isFull ? '100%' : height - 8);
    }, [ height, isFull ]);

    console.log(frameHeight);
    return (
        <PageContent styleName="root">
            <div styleName="wrap" ref={rightEl}>
                <div styleName="left" style={{ height: frameHeight }}>
                    <div styleName="tool">
                        <div>
                            目录
                        </div>
                        <FullScreen
                            inFrame
                            element={rightEl.current}
                            onFull={() => setIsFull(true)}
                            onExit={() => setIsFull(false)}
                        />
                    </div>
                    <div styleName="contents">
                        <div style={{ width: 100, height: 1000, background: 'red' }}/>
                    </div>
                </div>
                <div styleName="right">
                    <iframe
                        width="100%"
                        height={frameHeight}
                        src={`${PUBLIC_URL}/kityminder-editor/dist/index.html?projectId=${projectId}&mindId=${mindId}`}
                        frameBorder="0"
                    />
                </div>
            </div>
        </PageContent>
    );
});
