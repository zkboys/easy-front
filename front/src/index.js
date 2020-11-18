import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as storage from 'src/library/utils/storage';
import App from './App';
import { store } from './models';
import * as serviceWorker from './serviceWorker';
import { getLoginUser } from './commons';

import './public-path';
import './index.css';
import './mobile.css';

// dev 模式开启mock
if (process.env.NODE_ENV === 'development' || process.env.MOCK === 'true') {
    require('./mock/index');
    console.log('current mode is development, mock is enabled');
}

const currentUser = getLoginUser() || {};

// 存储初始化 区分不同用户存储的数据
storage.init({
    keyPrefix: currentUser.id,
});


function render(props) {
    const { container } = props;
    ReactDOM.render(<Provider store={store}><App/></Provider>, container ? container.querySelector('#root') : document.querySelector('#root'));
}

function storeTest(props) {
    props.onGlobalStateChange((value, prev) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev), true);
    props.setGlobalState({
        ignore: props.name,
        user: {
            name: props.name,
        },
    });
}
if (!window.__POWERED_BY_QIANKUN__) {
    render({});
}


export async function bootstrap() {
    console.log('[react16] react app bootstraped');
}

export async function mount(props) {
    console.log('[react16] props from main framework', props);
    storeTest(props);
    render(props);
}

export async function unmount(props) {
    const { container } = props;
    ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'));
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
