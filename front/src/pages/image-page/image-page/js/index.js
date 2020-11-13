function renderBlocks(blocks, BASE_WIDTH) {
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
}

function throttle(fun, delay, time) {
    var timeout,
        startTime = new Date();

    return function() {
        var context = this,
            args = arguments,
            curTime = new Date();

        clearTimeout(timeout);
        // 如果达到了规定的触发时间间隔，触发 handler
        if (curTime - startTime >= time) {
            fun.apply(context, args);
            startTime = curTime;
            // 没达到触发间隔，重新设定定时器
        } else {
            timeout = setTimeout(fun, delay);
        }
    };
}

var num = document.getElementsByTagName('img').length;
var img = document.getElementsByTagName('img');
var n = 0; //存储图片加载到的位置，避免每次都从第一张图片开始遍历

lazyload(); //页面载入完毕加载可是区域内的图片

function lazyload() { //监听页面滚动事件
    var seeHeight = document.documentElement.clientHeight; //可见区域高度
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop; //滚动条距离顶部高度
    for (var i = n; i < num; i++) {
        if (img[i].offsetTop < seeHeight + scrollTop) {
            var src = img[i].getAttribute('src');
            if (src.indexOf('.min.') !== -1) {
                img[i].src = src.replace('.min', '');
            }
            n = i + 1;
        }
    }
}

// 采用了节流函数
// window.addEventListener('scroll', throttle(lazyload, 500, 1000));
window.addEventListener('scroll', lazyload);

