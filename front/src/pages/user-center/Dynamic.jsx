import React, { useEffect } from 'react';
import config from 'src/commons/config-hoc';

export default config()(props => {
    const { height } = props;

    useEffect(() => {
        console.log('didMount');
        return () => {
            console.log('willUnmount');
        };
    }, []);
    return (
        <div className="pan-content" style={{ height: height + 50 }}>
            底部内容
            <div style={{ height: 1000, width: 100, background: 'red' }}></div>
        </div>
    );
});
