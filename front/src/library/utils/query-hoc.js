import React, { Component } from 'react';
import queryString from 'qs';

export default ({ propName = 'query', convertQuery } = {}) => WrappedComponent => {
    class WithSubscription extends Component {
        constructor(props) {
            super(props);
            const search = queryString.parse(window.location.search, { ignoreQueryPrefix: true });
            this.query = search || {};

            // 如果是纯数字，转换为数字
            if (convertQuery) {
                Object.entries(this.query).forEach(([ key, value ]) => {
                    if (/^[1-9][0-9]*$/.test(value)) this.query[key] = Number(value);
                });
            }
        }

        static displayName = `WithQuery(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

        render() {
            const injectProps = {
                [propName]: this.query,
            };
            return <WrappedComponent {...injectProps} {...this.props}/>;
        }
    }

    return WithSubscription;
};
