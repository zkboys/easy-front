'use strict';
const path = require('path');
const fs = require('fs');
const uuid = require('uuid/v4');
const { pathToRegexp } = require('path-to-regexp');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const fileExists = util.promisify(fs.exists);
const unlinkFile = util.promisify(fs.unlink);

module.exports = {
  mkdirsSync: mkdirsSync,
  async copyDir(from, to) {
    return new Promise((resolve, reject) => {
      copyDir(from, to, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  },

  async unlinkFile(filePath) {
    const exist = await fileExists(filePath);
    if (exist) await unlinkFile(filePath);
  },
  async writeFile(filePath, content) {
    await writeFile(filePath, content, 'UTF-8');
  },
  async readFile(filePath) {
    return await readFile(filePath, 'UTF-8');
  },
  async fileExists(filePath) {
    return await fileExists(filePath);
  },
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
  // upload/file
  async streamToUploadFile(stream, uploadPath) {
    return new Promise((resolve, reject) => {
      const fileFolder = path.join(this.app.baseDir, 'app', uploadPath);

      mkdirsSync(fileFolder);

      const ext = path.extname(stream.filename);
      const filename = `${uuid()}${ext}`;
      const filePath = path.join(fileFolder, filename);

      const write = fs.createWriteStream(filePath);
      stream.pipe(write);
      stream.on('end', async function() {
        resolve(`/${uploadPath}/${filename}`);
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

/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src, dist, callback) {
  fs.access(dist, function(err) {
    if (err) {
      // 目录不存在时创建目录
      fs.mkdirSync(dist);
    }
    _copy(null, src, dist);
  });

  function _copy(err, src, dist) {
    if (err) {
      callback(err);
    } else {
      fs.readdir(src, function(err, paths) {
        if (err) {
          callback(err);
        } else {
          paths.forEach(function(path) {
            const _src = src + '/' + path;
            const _dist = dist + '/' + path;
            fs.stat(_src, function(err, stat) {
              if (err) {
                callback(err);
              } else {
                // 判断是文件还是目录
                if (stat.isFile()) {
                  fs.writeFileSync(_dist, fs.readFileSync(_src));
                } else if (stat.isDirectory()) {
                  // 当是目录是，递归复制
                  copyDir(_src, _dist, callback);
                }
              }
            });
          });
        }
      });
    }
  }
}
