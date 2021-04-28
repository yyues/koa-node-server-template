const UserService = require("../sever/user");
// 处理数据库获得的数据
const { getOneDbData, getListDbData } = require("../util/json");
// res状态码，我觉得得全局应用
const Result = require("../util/result");

const { enCrypto } = require("../config/bcrypt");
module.exports = {
  //register
  register: async (ctx) => {
    let { username, password } = ctx.request.body;
    // 添加
  },
  // login
  Login: async (ctx) => {
    let { username, password } = ctx.request.body;
    // 查找
  },
};
