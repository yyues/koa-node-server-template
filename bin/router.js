//router,添加在这添加
const index = require("../router/index");
const user = require("../router/user");
const utils = require("../router/utils");

const routers = [index, user, utils];
const AddRouter = (app) => {
  routers.forEach((item) => {
    app.use(item.routes());
  });
};
module.exports = {
  AddRouter,
};
