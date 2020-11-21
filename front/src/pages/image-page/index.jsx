// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/react';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Slider, Upload, Form, Empty, Modal } from 'antd';
import {
    UploadOutlined,
    ExportOutlined,
    RollbackOutlined,
    SaveOutlined,
    CloudUploadOutlined,
} from '@ant-design/icons';
import { v4 as uuid } from 'uuid';
import { Rnd } from 'react-rnd';
import JSON5 from 'json5';

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
    getCurlyBracketContent,
} from './util';
import './style.less';
import { useGet, usePost } from '@/commons/ajax';

const EditTable = tableEditable(Table);

const BASE_WIDTH = 400;

export default config({ path: '/teams/:teamId/image-page/:id', side: false })(props => {
    const { match: { params: { teamId, id: imagePageId } } } = props;

    const blockRef = useRef(null);
    const containerRef = useRef(null);
    const [ form ] = Form.useForm();

    const [ pageLoading, setPageLoading ] = useState(false);
    const [ data, setData ] = useState({});
    const [ size, setSize ] = useState('');
    const [ hotBlockFileOptions, setHotBlockFileOptions ] = useState([]);
    const [ actionOptions, setActionOptions ] = useState([]);

    const [ blocks, setBlocks ] = useState([]);
    const [ blockVisible, setBlockVisible ] = useState(true);
    const [ currentBlockId, setCurrentBlockId ] = useState(null);
    const [ imageSrc, setImageSrc ] = useState(null);
    const [ imageOriSrc, setImageOriSrc ] = useState(null);

    const [ loading, fetchImagePage ] = useGet('/teams/:teamId/imagePages/:id');


    useEffect(() => {
        (async () => {
            await getImagePage();
        })();
    }, []);

    const columns = [
        {
            title: '热区名称', dataIndex: 'name',
            formProps: (record) => {
                return {
                    onBlur: async (e) => {
                        record.name = e.target.value;
                        await saveBlocks(blocks);
                    },
                };
            },
        },
        {
            title: '热区动作', dataIndex: 'action',
            formProps: (record) => {
                return {
                    type: 'select',
                    options: actionOptions,
                    onChange: async (value) => {
                        record.action = value;
                        await saveBlocks(blocks);
                    },
                };
            },
        },
        {
            title: '热区动作参数', dataIndex: 'actionParam',
            formProps: (record) => {
                return {
                    onBlur: async (e) => {
                        record.actionParam = e.target.value;
                        await saveBlocks(blocks);
                    },
                };
            },
        },
        {
            title: '操作', dataIndex: 'operator', width: 70,
            render: (value, record) => {
                const { id: blockId, name } = record;

                const items = [
                    {
                        label: '删除',
                        color: 'red',
                        confirm: {
                            title: `您确定删除"${name}"?`,
                            onConfirm: () => handleDeleteBlock(blockId),
                        },
                    },
                ];

                return <Operator items={items}/>;
            },
        },
    ];

    async function getImagePage() {
        const data = await fetchImagePage({ teamId, id: imagePageId });

        setPageLoading(true);
        setData(data);

        // TODO 发请求，获取team下所有 hotBlockFile文件
        const files = [
            {
                id: 1,
                name: '测试文件',
                description: '文件的描述',
                url: 'http://localhost:4001/hot_block_file.js',
            },
            {
                id: 2,
                name: '测试文件2',
                description: '文件的描述2',
                url: 'http://localhost:4001/hot_block_file2.js',
            },
        ];

        setHotBlockFileOptions(files.map(item => {
            const { id, name, description } = item;
            return { ...item, value: id, label: `${name} - ${description}` };
        }));

        await handleBlockFileChange(data.hotBlockFileId);

        // 原始图片
        const { base64: oriBase64 } = await compressImage(data?.src, 100);

        // 压缩后
        const { base64, width, height } = await compressImage(data?.src, data?.quality || 100);
        const size = getImageSizeByBase64(base64);

        setImageSrc(base64);
        setImageOriSrc(oriBase64);
        setBlocks(data?.hotBlocks);
        setSize(`${renderSize(size)}  ${width} * ${height}`);
        form.setFieldsValue({ ...data });

        setPageLoading(false);
    }

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

    async function handleMouseUp(e) {
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
        const nextBlocks = [ ...blocks, { id: blockId, name: '新建热区', left, top, width, height } ];
        await saveBlocks(nextBlocks);
        handleBlockClick(blockId, nextBlocks);
    }

    async function saveBlocks(nextBlocks) {
        setBlocks(nextBlocks);

        // const blocks = await saveHotBlock({ teamId, id: imagePageId, blocks: nextBlocks });
        //
        // setBlocks(blocks);
    }

    async function handleQualityChange(value, data) {
        const src = data || imageOriSrc;

        const { base64, width, height } = await compressImage(src, value);
        setImageSrc(base64);
        const size = getImageSizeByBase64(base64);
        setSize(`${renderSize(size)}  ${width} * ${height}`);
    }

    function handleBlockClick(blockId, nb) {
        const block = (nb || blocks).find(item => item.id === blockId);
        setCurrentBlockId(blockId);
        form.setFieldsValue({
            name: undefined,
            action: undefined,
            actionParam: undefined,
            ...block,
        });
    }

    async function handleDeleteBlock(blockId) {
        const nextBlocks = blocks.filter(item => item.id !== blockId);

        await saveBlocks(nextBlocks);
    }

    async function handleBlockFileChange(fileId) {
        // 清空热区参数
        blocks.forEach(item => {
            item.action = undefined;
            item.actionParam = undefined;
            item._form.setFieldsValue({ action: undefined, actionParam: undefined });
        });
        setBlocks([ ...blocks ]);

        const fileData = hotBlockFileOptions.find(item => item.value === fileId);
        if (!fileData) {
            setActionOptions([]);
            return;
        }

        // 获取文件中定义的action
        const { url } = fileData;
        const content = await props.ajax.get(url);
        const actionsStr = getCurlyBracketContent(content);
        if (actionsStr) {
            const data = JSON5.parse(actionsStr);
            const options = Object.entries(data).map(([ value, label ]) => ({ value, label }));
            setActionOptions(options);
        }

    }

    function getBase64(img, callback) {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    async function handleImageChange(file) {
        getBase64(file, imageSrc => {
            setImageSrc(imageSrc);
            setImageOriSrc(imageSrc);

            handleQualityChange(100, imageSrc);
        });
        // TODO 上传图片到 oss 拿到 src
        const src = '';
        form.setFieldsValue({ quality: 100, src });
        return false;
    }

    async function handleExport() {
        const minHeight = form.getFieldValue('curHeight');
        await exportZip({
            imageSrc,
            blocks,
            minHeight,
            baseWidth: BASE_WIDTH,
        });
    }

    // 预览
    async function handleSave(deploy) {
        if (deploy) {
            await new Promise((resolve, reject) => Modal.confirm({
                title: '提示',
                content: '您确定进行发布吗？',
                onOk: () => resolve(),
                onCancel: () => reject('用户取消发布'),
            }));
        }
        // TODO
        console.log(deploy);
    }

    const itemProps = {
        labelWidth: 100,
    };

    const disabled = !imageSrc;

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
                showHotBlock: true,
                quality: 100,
                curHeight: 400,
            }}
        >
            <PageContent styleName="root" fitHeight loading={loading || pageLoading}>
                <div styleName="img-root-outer">
                    <div styleName="title">
                        <Button
                            icon={<RollbackOutlined/>}
                            onClick={() => props.history.goBack()}
                        >
                            返回团队
                        </Button>
                        <h2>{data.name}</h2>
                    </div>
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
                            {imageSrc ? (<img styleName="base-img" src={imageSrc} alt="图片"/>) : (
                                <div styleName="empty">
                                    <Empty description={renderUpload()}/>
                                </div>
                            )}
                            <div styleName="base-block" ref={blockRef}/>
                            {blockVisible && blocks.map(item => {
                                const { id: blockId, left: x, top: y, width, height } = item;

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
                    <div styleName="btns">
                        {renderUpload()}
                        <Button
                            disabled={disabled}
                            icon={<ExportOutlined/>}
                            onClick={handleExport}
                        >导出</Button>
                        <Button
                            type="primary"
                            disabled={disabled}
                            icon={<SaveOutlined/>}
                            onClick={() => handleSave()}
                        >保存</Button>
                        <Button
                            danger
                            disabled={disabled}
                            icon={<CloudUploadOutlined/>}
                            onClick={() => handleSave(true)}
                        >保存并发布</Button>
                    </div>

                    <FormElement {...itemProps} name="src" type="hidden"/>
                    <FormElement
                        {...itemProps}
                        style={{ marginTop: 50 }}
                        label="图片压缩比"
                        name="quality"
                        onAfterChange={handleQualityChange}
                        disabled={disabled}
                        required
                        tip={<div style={{ width: 200, paddingLeft: 16 }}>{size}</div>}
                    >
                        <Slider tooltipVisible/>
                    </FormElement>
                    <div css={css`display: flex; align-items: center`}>
                        <FormElement
                            {...itemProps}
                            width={190}
                            type="number"
                            label="相对裁剪高度"
                            name="curHeight"
                            step={50}
                            min={10}
                            required
                        />
                        <div css={css`padding-bottom: 18px; flex: 1; padding-left: 8px`}>
                            将图片裁剪成多个小图，提高加载性能，可以设置一个较大的值，不进行裁剪
                        </div>
                    </div>
                    <FormElement
                        {...itemProps}
                        label="热区事件文件"
                        type="select"
                        showSearch
                        name="hotBlockFileId"
                        disabled={disabled}
                        required
                        tip={<div style={{ width: 200 }}/>}
                        options={hotBlockFileOptions}
                        onChange={handleBlockFileChange}
                    />
                    <FormElement
                        {...itemProps}
                        label="显示热区"
                        type="switch"
                        name="showHotBlock"
                        onChange={setBlockVisible}
                        width={190}
                        tip={<span>共{blocks.length}个</span>}
                        disabled={disabled}
                    />
                    <EditTable
                        columns={columns}
                        dataSource={blocks}
                        rowKey="id"
                        onRow={record => {
                            return {
                                onClick: () => setCurrentBlockId(record.id),
                            };
                        }}
                        rowClassName={record => {
                            return record.id === currentBlockId ? 'table-row-active' : '';
                        }}
                    />
                </div>
            </PageContent>
        </Form>
    );
});
