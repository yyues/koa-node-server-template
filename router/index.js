const router = require("koa-router")();
// 调用user方法查找满足条件用户
const UserController = require("../controller/user");
// 先给一个token
const { EncodeToken } = require("../config/token");

const { getCodeText } = require("../config/verification");
router.get("/", async (ctx, next) => {
  ctx.body = {
    verification: getCodeText,
    msg: "你的世界变得那么大了，我也就变得可有可无了",
  };
});
router.get("/home", async (ctx, next) => {
  ctx.body = "home";
});
router.post("/login", async (ctx) => {
  let data = { username: "yaoyue" };
  let token = EncodeToken(data);
  // success
  //下面只需要登录就可以了，
  ctx.body = "success";
});

module.exports = router;
