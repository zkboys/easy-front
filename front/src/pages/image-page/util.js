import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import md5 from 'blueimp-md5';
import getHtml from './templates/simple';

export function renderSize(value) {
    if (!value) return '0 Bytes';

    const unitArr = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
    const values = parseFloat(value);
    const index = Math.floor(Math.log(values) / Math.log(1024));
    let size = values / Math.pow(1024, index);
    size = size.toFixed(2);//保留的小数位数
    return size + unitArr[index];
}

export function getImageSizeByBase64(imageBase64Data) {
    // (((4 * e.file.size) / 3) + 3) & ~3 === base64Data.length
    // ~3 = -4

    let arr = imageBase64Data.split(',');
    const base64Data = arr[1];
    const fileSize = ((base64Data.length - 3) * 3) / 4;
    return window.parseInt(fileSize, 10) + 3;
}

export function getImageType(fileName) {
    const imageTypes = [
        'jpg',
        'jpeg',
        'gif',
        'png',
        'tiff',
        'svg',
        'ico',
        'bmp',
        'tag',
        'psd',
        'tiff',
        'dds',
        'pic',
        'pcx',
        'cdr',
        'hdri',
        'raw',
        'SVG',
        'ai',
        'swf',
        'svg',
        'eps',
    ];
    if (fileName) {
        const index = fileName.lastIndexOf('.');
        let type = fileName.substr(index + 1);
        type = type.toLowerCase();
        if (imageTypes.includes(type)) {
            return `image/${type}`;
        }
    }
    return 'image/jpeg';
}

// 图片压缩
export function compressImage(imageBase64, quality) {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.src = imageBase64;
        img.onload = function() {
            const imageWidth = img.width;
            const imageHeight = img.height;

            const width = (quality / 100) * imageWidth;
            const height = (quality / 100) * imageHeight;

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;

            // 核心JS就这个
            context.drawImage(img, 0, 0, width, height);

            const type = getImageType(imageBase64);

            const result = canvas.toDataURL(type);

            resolve({ base64: result, width, height });
        };
        img.onerror = function(err) {
            reject(err);
        };
    });
}


export function getX(obj) {
    let parObj = obj;
    let left = obj.offsetLeft;
    while (parObj) {
        parObj = parObj.offsetParent;
        if (!parObj) break;
        left += parObj.offsetLeft;
    }
    return left;
}

export function getY(obj) {
    let parObj = obj;
    let top = obj.offsetTop;
    while (parObj) {
        parObj = parObj.offsetParent;
        if (!parObj) break;
        top += parObj.offsetTop;
    }
    return top;
}

export async function exportZip(options) {
    const {
        imageUrl: imageBase64,
        blocks,
        minHeight,
        baseWidth,
    } = options;
    const images = await getImageBase64List(imageBase64, minHeight, baseWidth);

    // 初始化一个zip打包对象
    const zip = new JSZip();
    const folder = zip.folder('image-page');
    // 创建一个名为images的新的文件目录
    const imagesFolder = folder.folder('images');

    const imgType = getImageType(imageBase64).replace('image/', '');
    const imageNames = [];
    const minImageNames = [];

    for (let index = 0; index < images.length; index++) {
        const imgData = images[index];
        const data = imgData.replace('data:image/jpeg;base64,', '');
        let { base64: minData } = await compressImage(imgData, 1);
        minData = minData.replace('data:image/jpeg;base64,', '');

        const name = `${index}-${md5(imgData)}.${imgType}`;
        const minName = `${index}-${md5(imgData)}.min.${imgType}`;
        imageNames.push(name);
        minImageNames.push(minName);

        imagesFolder.file(name, data, { base64: true });
        imagesFolder.file(minName, minData, { base64: true });
    }

    blocks.forEach(item => {
        const { left, top, width, height } = item;
        item.spec = [ left, top, width, height ];
    });

    const html = getHtml({ blocks, imageNames, minImageNames, baseWidth });

    folder.file('index.html', html);

    // 把打包内容异步转成blob二进制格式
    zip.generateAsync({ type: 'blob' }).then(function(content) {
        // content就是blob数据，这里以example.zip名称下载
        // 使用了FileSaver.js
        saveAs(content, 'image-page.zip');
    });
}

async function getImageBase64List(imageBase64, minHeight, baseWidth) {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.src = imageBase64;
        img.onload = function() {
            const imageWidth = img.width;
            const imageHeight = img.height;

            const baseHeight = (imageWidth / baseWidth) * minHeight;

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // 向上取整
            const count = Math.ceil((imageHeight / baseHeight));
            const result = [];
            for (let i = 0; i < count; i++) {
                const sy = i * baseHeight;
                let height = baseHeight;

                if (i === count - 1) {
                    height = imageHeight - i * baseHeight;
                }

                // canvas清屏
                canvas.width = imageWidth;
                canvas.height = height;

                context.clearRect(0, 0, imageWidth, height);
                context.drawImage(img, 0, sy, imageWidth, height, 0, 0, imageWidth, height);
                const type = getImageType(imageBase64);

                const data = canvas.toDataURL(type);

                result.push(data);
            }
            resolve(result);
        };
        img.onerror = function(err) {
            reject(err);
        };
    });
}

