// 登录拦截控制

const { decodeToken } = require("./token");

const result = require("../util/result");
// 不被拦截的请求
const defultRouter = ["/login", "/home", "/"];

function FILTER(app) {
  app.use(async (ctx, next) => {
    let currentUrl = ctx.originalUrl;
    console.log(currentUrl);
    if (defultRouter.indexOf(currentUrl) !== -1) {
      // 我觉得这个地方使用来放行登录接口的
      console.log(currentUrl + " 不被拦截，允许放行");
      await next();
    } else {
      // 前端传过来的key值默认为token
      let token = ctx.header.token;
      if (!token) {
        // token 不存在，需要返回登录接口
        ctx.body = result.noLogin;
      } else {
        console.log(decodeToken(token));
        if (decodeToken(token).iat) {
          // 说明登录至少不是过期的
          await next();
        } else {
          ctx.body = result.loginOutTime;
        }
      }
    }
  });
}

module.exports = FILTER;
