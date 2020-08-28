'use strict';
const request = require('request');

const weChatMessageServer = 'http://wechat-message.suixingpay.com';
const messageToken = '7TqZVmJ2B'; // 研发小助手

async function getWeChatUsers() {
  if (!messageToken) throw ('消息token未定义');
  if (!weChatMessageServer) throw ('微信消息平台服务地址未定义');

  return new Promise((resolve, reject) => {
    request({
      url: weChatMessageServer + '/api/wechat/agent/users?token=' + messageToken,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }, (err, response, data) => {
      if (err) return reject(err);

      if (data) {
        try {
          const jsonData = JSON.parse(data);

          resolve(jsonData);
        } catch (e) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('getWeChatUsers error: ' + data);
        }
      } else {
        reject(response);
      }
    });
  });
}

module.exports = {
  getWeChatUsers,
};

