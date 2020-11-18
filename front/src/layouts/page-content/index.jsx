import React, { Component } from 'react';
import { Spin } from 'antd';
import PropTypes from 'prop-types';
import Footer from '../footer';
import { connect } from 'src/models';
import './style.less';
import { PAGE_FRAME_LAYOUT } from 'src/models/settings';
import { getElementTop } from '@/library/utils';

/**
 * 页面内容 容器
 * 1. 添加统一padding、background等样式
 * 1. 自动判断是否含有FixBottom，并为之腾出空间
 * 1. 是否含有公共footer
 */
@connect(state => ({
    pageLoading: state.page.loading,
    pageLoadingTip: state.page.loadingTip,
    sideWidth: state.side.width,
    showSide: state.side.show,
    layout: state.settings.pageFrameLayout,
}))
export default class PageContent extends Component {
    static propTypes = {
        loading: PropTypes.bool,
        loadingTip: PropTypes.any,
        pageLoading: PropTypes.bool,
        footer: PropTypes.bool,
        fitHeight: PropTypes.bool,
    };

    static defaultProps = {
        footer: false,
    };

    state = {
        height: 'auto',
    };

    componentWillUnmount() {
        this.props.action.page.hideLoading();

        this.props.fitHeight && window.removeEventListener('resize', this.setHeight);
    }

    componentDidMount() {
        if (this.props.fitHeight) {
            this.setHeight();
            window.addEventListener('resize', this.setHeight);
        }
    }

    setHeight = () => {
        if (!this.contentDom) return;
        const offsetTop = getElementTop(this.contentDom);
        const windowHeight = document.documentElement.clientHeight;

        const height = windowHeight - offsetTop - 8;
        this.setState({ height });
    };

    render() {
        const {
            footer,
            loading,
            loadingTip,
            pageLoading,
            pageLoadingTip,
            children,
            action,
            className,
            sideWidth,
            showSide,
            layout,
            fitHeight,
            style,
            ...others
        } = this.props;

        const { height } = this.state;

        let hasFixBottom = false;
        React.Children.map(children, item => {
            if (item && item.type && item.type.__FIX_BOTTOM) hasFixBottom = true;
        }, null);

        const rootStyle = {};
        if (hasFixBottom) {
            rootStyle.marginBottom = '66px';
        }

        const isLoading = loading || pageLoading;
        const tip = loadingTip || pageLoadingTip;
        const top = this.root?.offsetTop || 0;

        const isTopSideMenu = layout === PAGE_FRAME_LAYOUT.TOP_SIDE_MENU;
        const isSideMenu = layout === PAGE_FRAME_LAYOUT.SIDE_MENU;
        const hasSide = isTopSideMenu || isSideMenu;

        let contentStyle = {};

        if (fitHeight) {

            contentStyle = {
                flex: `0 0 ${height}px`,
                height: height,
                overflowY: 'auto',
            };
        }

        return (
            <div ref={node => this.root = node} style={rootStyle} styleName="page-content-root">
                <div
                    styleName="page-loading"
                    style={{
                        display: isLoading ? 'block' : 'none',
                        left: hasSide && showSide ? sideWidth : 0,
                        top,
                    }}
                >
                    <Spin spinning tip={tip}/>
                </div>
                <div
                    ref={node => this.contentDom = node}
                    className={`${className} page-content`}
                    styleName="page-content"
                    style={{ ...contentStyle, ...style }}
                    {...others}
                >
                    {children}
                </div>
                {footer ? <div styleName="footer"><Footer/></div> : null}
            </div>
        );
    }
}
