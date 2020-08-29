import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'src/library/components';
import Breadcrumb from '../breadcrumb';
import './style.less';

export default class PageHead extends Component {
    static propTypes = {
        title: PropTypes.any,
        breadcrumbs: PropTypes.array,
    };
    static defaultProps = {
        title: '',
        breadcrumbs: [],
    };

    render() {
        let { title, breadcrumbs } = this.props;

        let icon;
        let text = title;

        if (typeof title === 'object' && title.icon) icon = title.icon;

        if (typeof title === 'object' && title.text) text = title.text;

        return (
            <div styleName="page-header">
                <h1>
                    {icon ? <Icon styleName="icon" type={icon}/> : null}
                    <span styleName="title">{text}</span>
                </h1>

                <div styleName="breadcrumb">
                    <Breadcrumb dataSource={breadcrumbs}/>
                </div>
            </div>
        );
    }
}
