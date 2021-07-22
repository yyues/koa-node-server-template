/*
 * @Author: yaoyue
 * @Date: 2021-07-20 10:09:26
 * @LastEditTime: 2021-07-22 10:08:46
 * @LastEditors: Please set LastEditors
 * @Description: router 总列表，减少app内代码
 * @FilePath: \Base-Koa\bin\router.js
 */
//router,添加在这添加
const common = require("../router/Common");
const user = require("../router/User");

const routers = [common, user];
const AddRouter = (app) => {
  routers.forEach((item) => {
    app.use(item.routes());
  });
};
module.exports = {
  AddRouter,
};
