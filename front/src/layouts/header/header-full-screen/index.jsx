import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import config from 'src/commons/config-hoc';

@config({
    event: true,
})
export default class HeaderFullScreen extends Component {
    static propTypes = {
        element: PropTypes.any,
        toFullTip: PropTypes.any,
        exitFullTip: PropTypes.any,

    };
    static defaultProps = {
        element: document.documentElement,
        toFullTip: '全屏',
        exitFullTip: '退出全屏',
    };
    state = {
        fullScreen: false,
        toolTipVisible: false,
    };

    componentDidMount() {
        let fullScreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;

        this.props.addEventListener(document, 'fullscreenchange', this.handleFullScreenChange);
        this.props.addEventListener(document, 'mozfullscreenchange', this.handleFullScreenChange);
        this.props.addEventListener(document, 'webkitfullscreenchange', this.handleFullScreenChange);
        this.props.addEventListener(document, 'msfullscreenchange', this.handleFullScreenChange);
        this.props.addEventListener(document, 'click', () => this.handleToolTipHide(0));
        this.setState({ fullScreen: !!fullScreen });
    }

    handleFullScreenClick = () => {
        const { element } = this.props;

        const { fullScreen } = this.state;
        if (fullScreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        } else {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullScreen();
            }
        }
    };

    handleFullScreenChange = () => {
        const { fullScreen } = this.state;
        this.setState({ fullScreen: !fullScreen });
    };

    handleToolTipShow = () => {
        if (this.ST) clearTimeout(this.ST);
        this.setState({ toolTipVisible: true });
    };

    handleToolTipHide = (time = 300) => {
        this.ST = setTimeout(() => {
            this.setState({ toolTipVisible: false });
        }, time);
    };

    render() {
        const { className, toFullTip, exitFullTip } = this.props;
        const { fullScreen, toolTipVisible } = this.state;
        return (
            <div
                className={className}
                style={{
                    fontSize: 14,
                }}
                onClick={this.handleFullScreenClick}
                onMouseEnter={this.handleToolTipShow}
                onMouseLeave={() => this.handleToolTipHide()}
            >
                <Tooltip visible={toolTipVisible} placement="bottom" title={fullScreen ? exitFullTip : toFullTip}>
                    {fullScreen ? (
                        <FullscreenExitOutlined/>
                    ) : (
                        <FullscreenOutlined/>
                    )}
                </Tooltip>
            </div>
        );
    }
}
