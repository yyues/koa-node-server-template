const router = require("koa-router")();
const UserController = require("../controller/user");
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
router.post("/login");

module.exports = router;
