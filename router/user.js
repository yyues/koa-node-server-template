const router = require("koa-router")();
const UserController = require("../controller/user");

router.prefix("/user");
router.get("/", async (ctx, next) => {
  ctx.body = "user";
});

module.exports = router;
