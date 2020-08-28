'use strict';

const { getWeChatUsers } = require('./wechat');

module.exports = {
  getWeChatUsers,
};
/*

(async function() {
  const data = await getWeChatUsers();
  data.forEach(item => {
    if (item.name === '王怡') console.log(item);
  });
})();
*/
