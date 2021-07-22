/*
 * @Author: your name
 * @Date: 2021-07-20 10:09:26
 * @LastEditTime: 2021-07-22 11:05:45
 * @LastEditors: Please set LastEditors
 * @Description: 登录拦截器
 * @FilePath: \Base-Koa\Config\interceptor.js
 */

const { handleToken } = require("../Token");

const result = require("../../Util/Result");
// 不被拦截的请求
const defultRouter = ["/login", "/upload", "/"];

function FILTER(app) {
  app.use(async (ctx, next) => {
    let currentUrl = ctx.originalUrl;

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
        if (handleToken(token).iat) {
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
