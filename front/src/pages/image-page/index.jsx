import React, { useState, useRef } from 'react';
import { Button, Slider, Upload, Form, Empty } from 'antd';
import { UploadOutlined, ExportOutlined } from '@ant-design/icons';
import { v4 as uuid } from 'uuid';
import { Rnd } from 'react-rnd';

import config from 'src/commons/config-hoc';
import PageContent from 'src/layouts/page-content';
import { FormElement, Operator, Table, tableEditable } from 'src/library/components';
import {
    renderSize,
    getImageSizeByBase64,
    compressImage,
    getX,
    getY,
    exportZip,
} from './util';
import './style.less';

const EditTable = tableEditable(Table);

const BASE_WIDTH = 400;

export default config({ path: '/image-page', noAuth: true })(props => {
    const blockRef = useRef(null);
    const containerRef = useRef(null);
    const [ form ] = Form.useForm();

    const [ blocks, setBlocks ] = useState([]);
    const [ blockVisible, setBlockVisible ] = useState(true);
    const [ currentBlockId, setCurrentBlockId ] = useState(null);
    const [ imageUrl, setImageUrl ] = useState(null);
    const [ imageOriUrl, setImageOriUrl ] = useState(null);

    const columns = [
        {
            title: '热区名称', dataIndex: 'blockName',
            formProps: (record) => {
                return {
                    onBlur: (e) => {
                        record.blockName = e.target.value;
                    },
                };
            },
        },
        {
            title: '热区连接', dataIndex: 'blockHref',
            formProps: (record) => {
                return {
                    onBlur: (e) => {
                        record.blockHref = e.target.value;
                    },
                };
            },
        },
        {
            title: '热区事件', dataIndex: 'blockAction',
            formProps: (record) => {
                return {
                    onBlur: (e) => {
                        record.blockAction = e.target.value;
                    },
                };
            },
        },
        {
            title: '操作', dataIndex: 'operator', width: 70,
            render: (value, record) => {
                const { blockId, blockName } = record;

                const items = [
                    {
                        label: '删除',
                        color: 'red',
                        confirm: {
                            title: `您确定删除"${blockName}"?`,
                            onConfirm: () => handleDeleteBlock(blockId),
                        },
                    },
                ];

                return <Operator items={items}/>;
            },
        },
    ];

    function handleMouseDown(e) {
        // console.log('handleMouseDown');
        e.preventDefault();
        const container = containerRef.current;
        const scrollTop = container.parentNode.scrollTop;

        const x = e.pageX - getX(container);
        const y = e.pageY - getY(container) + scrollTop;

        const div = blockRef.current;
        div.style.display = 'block';
        div.style.top = `${y}px`;
        div.style.left = `${x}px`;

        div.startPosition = { x, y };
    }

    function handleMouseMove(e) {
        // console.log('handleMouseMove');
        e.preventDefault();
        const div = blockRef.current;

        if (div.style.display !== 'block') return;


        const container = containerRef.current;
        const scrollTop = container.parentNode.scrollTop;

        const x = e.pageX - getX(container);
        const y = e.pageY - getY(container) + scrollTop;

        let { x: left, y: top } = div.startPosition;
        let width = x - left;
        let height = y - top;

        if (width < 0) {
            left = x;
            width = -width;
        }

        if (height < 0) {
            top = y;
            height = -height;
        }

        div.style.top = `${top}px`;
        div.style.left = `${left}px`;
        div.style.width = `${width}px`;
        div.style.height = `${height}px`;
    }

    function handleMouseUp(e) {
        // console.log('handleMouseUp');
        e.preventDefault();

        const div = blockRef.current;

        if (div.style.display !== 'block') return;

        const left = parseFloat(div.style.left, 10);
        const top = parseFloat(div.style.top, 10);
        const width = parseFloat(div.style.width, 10);
        const height = parseFloat(div.style.height, 10);

        // 恢复div样式
        div.style.display = 'none';
        div.style.width = 0;
        div.style.height = 0;
        div.style.left = 0;
        div.style.top = 0;

        // 如果尺寸很小，不保存
        if (width < 10 || height < 10) return;

        const blockId = uuid();
        const nextBlocks = [ ...blocks, { blockId, blockName: '新建热区', left, top, width, height } ];
        setBlocks(nextBlocks);
        handleBlockClick(blockId, nextBlocks);
    }

    async function handleQualityChange(value, data) {
        const url = data || imageOriUrl;

        const { base64, width, height } = await compressImage(url, value);
        setImageUrl(base64);
        const size = getImageSizeByBase64(base64);
        form.setFieldsValue({ size: `${renderSize(size)}  ${width} * ${height}` });
    }

    function handleBlockClick(blockId, nb) {
        const block = (nb || blocks).find(item => item.blockId === blockId);
        setCurrentBlockId(blockId);
        form.setFieldsValue({
            blockName: undefined,
            blockHref: undefined,
            blockAction: undefined,
            ...block,
        });
    }

    function handleDeleteBlock(blockId) {
        const nextBlocks = blocks.filter(item => item.blockId !== blockId);

        setBlocks(nextBlocks);
    }

    function getBase64(img, callback) {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    function handleImageChange(file) {
        getBase64(file, imageUrl => {
            setImageUrl(imageUrl);
            setImageOriUrl(imageUrl);

            handleQualityChange(100, imageUrl);
        });
        setBlocks([]);
        form.resetFields();
        form.setFieldsValue({ size: renderSize(file.size) });
        return false;
    }

    async function handleExport() {
        const minHeight = form.getFieldValue('minHeight');
        await exportZip({
            imageUrl,
            blocks,
            minHeight,
            baseWidth: BASE_WIDTH,
        });
    }

    const itemProps = {
        labelWidth: 100,
    };

    const disabled = !imageUrl;

    const renderUpload = () => (
        <Upload
            accept="image/jpg,image/jpeg,image/png"
            showUploadList={false}
            beforeUpload={handleImageChange}
        >
            <Button icon={<UploadOutlined/>} type="primary">上传图片</Button>
        </Upload>
    );
    return (
        <Form
            form={form}
            initialValues={{
                blockVisible: true,
                quality: 100,
                minHeight: 400,
            }}
        >
            <PageContent styleName="root" fitHeight>
                <div styleName="img-root-outer">
                    <div styleName="tip-block">
                        {disabled ? null : (<div style={{ width: BASE_WIDTH }} styleName="width-tip">{BASE_WIDTH}px</div>)}
                    </div>
                    <div styleName="img-root">
                        <div
                            ref={containerRef}
                            styleName="img-container"
                            style={{ width: BASE_WIDTH }}
                            onMouseDown={!disabled && handleMouseDown}
                            onMouseMove={!disabled && handleMouseMove}
                            onMouseUp={!disabled && handleMouseUp}
                        >
                            {imageUrl ? (<img styleName="base-img" src={imageUrl} alt="图片"/>) : (
                                <div styleName="empty">
                                    <Empty description={renderUpload()}/>
                                </div>
                            )}
                            <div styleName="base-block" ref={blockRef}/>
                            {blockVisible && blocks.map(item => {
                                const { blockId, left: x, top: y, width, height } = item;

                                const isActive = currentBlockId === blockId;
                                return (
                                    <Rnd
                                        styleName={isActive ? 'block active' : 'block'}
                                        key={blockId}
                                        default={{ x, y, width, height }}
                                        onDragStart={e => e.stopPropagation()}
                                        onDragStop={(e, d) => {
                                            item.left = d.x;
                                            item.top = d.y;
                                        }}
                                        onResizeStart={e => e.stopPropagation()}
                                        onResizeStop={(e, direction, ref, delta, position) => {
                                            const { x, y } = position;
                                            item.left = x;
                                            item.top = y;
                                            item.width = parseFloat(ref.style.width);
                                            item.height = parseFloat(ref.style.height);
                                        }}
                                        onClick={() => handleBlockClick(blockId)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div styleName="operator-root">
                    {renderUpload()}
                    <Button disabled={disabled} style={{ marginLeft: 16 }} icon={<ExportOutlined/>} onClick={handleExport}>导出</Button>

                    <FormElement
                        {...itemProps}
                        style={{ marginTop: 50 }}
                        label="图片压缩比"
                        name="quality"
                        onAfterChange={handleQualityChange}
                        disabled={disabled}
                    >
                        <Slider tooltipVisible/>
                    </FormElement>
                    <FormElement
                        {...itemProps}
                        label="图片大小"
                        name="size"
                        disabled
                    />
                    <FormElement
                        {...itemProps}
                        type="number"
                        label="相对裁剪高度"
                        name="minHeight"
                        width={190}
                        step={50}
                        min={10}
                    />
                    <FormElement
                        {...itemProps}
                        label="显示热区"
                        type="switch"
                        name="blockVisible"
                        onChange={setBlockVisible}
                        width={190}
                        tip={<span>共{blocks.length}个</span>}
                        disabled={disabled}
                    />
                    <EditTable
                        columns={columns}
                        dataSource={blocks}
                        rowKey="blockId"
                        onRow={record => {
                            return {
                                onClick: () => setCurrentBlockId(record.blockId),
                            };
                        }}
                        rowClassName={record => {
                            return record.blockId === currentBlockId ? 'table-row-active' : '';
                        }}
                    />
                </div>
            </PageContent>
        </Form>
    );
});
