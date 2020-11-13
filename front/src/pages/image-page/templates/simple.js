export default function(data) {
    const { imageNames, blocks, baseWidth } = data;
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no"/>
    <title>Title</title>
    <style>
        * {
            /*禁止文字被鼠标选中*/
            -moz-user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
            user-select: none;

            /*解决点击背景闪烁一下*/
            -webkit-tap-highlight-color: transparent;
        }

        body {
            padding: 0;
            margin: 0;
        }

        .image-container {
            position: relative;
            width: 100%;
            font-size: 0;
        }

        .image-container > img {
            width: 100%;
            height: auto;
        }

        .image-container > .block {
            position: absolute;
            cursor: pointer;
            opacity: .5;
        }

        .debug .image-container > .block {
            border: 1px solid red;
            background: rosybrown;
        }

        .image-container > .block > a {
            display: block;
            width: 100%;
            height: 100%;
        }

        .debug .image-container > .block > a {
            background: green;
        }
    </style>
</head>
<body>
<div class="image-container">
    ${imageNames.map((src, index) => `<img src="./images/${src}" alt="image${index}">`).join('\n    ')}
</div>

<script>
    var blocks = [${blocks.map(item => `
        {
            blockName: '${item.blockName || ''}',
            blockHref: '${item.blockHref || ''}',
            spec: ${JSON.stringify(item.spec)},
        }`)}
    ];

    var BASE_WIDTH = ${baseWidth};
    var container = document.querySelector('.image-container');
    var width = container.clientWidth;
    var ratio = width / BASE_WIDTH;
    if (window.location.href.includes('debug=true')) {
        document.body.classList.add('debug');
    }

    blocks.forEach(item => {
        var { spec, blockHref, onClick } = item;
        var [ left, top, width, height ] = spec;
        var div = document.createElement('div');
        div.classList.add('block');
        div.style.top = (top * ratio) + 'px';
        div.style.left = (left * ratio) + 'px';
        div.style.width = (width * ratio) + 'px';
        div.style.height = (height * ratio) + 'px';

        if (blockHref) {
            var a = document.createElement('a');
            a.href = blockHref;
            div.appendChild(a);
        }

        if (onClick) {
            div.addEventListener('click', onClick);
        }
        container.appendChild(div);
    });
</script>
</body>
</html>
    `;
}
