'use strict';
const path = require('path');
const fs = require('fs');
const uuid = require('uuid/v4');
const { pathToRegexp } = require('path-to-regexp');

module.exports = {
  async streamToBase64(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', function(chunk) {
        chunks.push(chunk);
      });
      stream.on('end', async function() {
        const buffer = Buffer.concat(chunks);

        const base64Str = buffer.toString('base64');
        resolve(base64Str);
      });
      stream.on('error', (err) => {
        reject(err);
      });
    });
  },
  async streamToUploadFile(stream, folder) {
    return new Promise((resolve, reject) => {
      const uploadPath = 'upload';
      const fileFolder = path.join(this.app.baseDir, 'app', uploadPath, folder);

      mkdirsSync(fileFolder);

      const ext = path.extname(stream.filename);
      const filename = `${uuid()}${ext}`;
      const filePath = path.join(fileFolder, filename);

      const write = fs.createWriteStream(filePath);
      stream.pipe(write);
      stream.on('end', async function() {
        resolve(`/${uploadPath}/${folder}/${filename}`);
      });
      stream.on('error', (err) => {
        reject(err);
      });
    });
  },
  async findApiByMethodAndPath(method, path) {
    const { Api } = this.app.model;

    // 根据 projectId method path 查找对应的api
    const methodApis = await Api.findAll({
      where: {
        method: method.toLowerCase(),
      },
    });

    return methodApis.find(item => {
      let apiPath = item.path;

      if (apiPath.includes('{')) {
        apiPath = apiPath.replace('{', ':').replace('}', '');
      }

      if (apiPath.includes(':')) {
        const re = pathToRegexp(apiPath);
        return !!re.exec(path);
      } else {
        return apiPath === path;
      }
    });
  },
  foo(param) {
    // this 是 helper 对象，在其中可以调用其他 helper 方法
    // this.ctx => context 对象
    // this.app => application 对象
    return param * 2;
  },
  money(val) {
    const lang = this.ctx.get('Accept-Language');
    if (lang.includes('zh-CN')) {
      return `￥ ${val}`;
    }
    return `$ ${val}`;
  },
};

//递归创建目录 同步方法
function mkdirsSync(dirname) {
  //console.log(dirname);
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}
