/*
 * @Author: yaoyue
 * @Date: 2021-07-20 10:09:26
 * @LastEditTime: 2021-07-20 15:06:51
 * @LastEditors: Please set LastEditors
 * @Description: token生成与校验模块
 * @FilePath: \Base-Koa\config\token.js
 */

const jwt = require("jsonwebtoken");
const { Base } = require("../index");
function getToken(payload) {
  return (
    "Bearer " +
    jwt.sign(payload, Base.secretOrKey, { expiresIn: Base.tokenExpiresIn })
  );
}
function handleToken(token) {
  let data = token.replace("Bearer ", "");
  const res = jwt.verify(data, Base.secretOrKey, (err, decode) => {
    if (err) {
      return err.message;
    } else {
      return decode;
    }
  });
  const now = new Date().getTime().toString();
  const date = now.substring(0, now.length - 3);
  if (date > res.exp) {
    //说明过期了
    return "登录过期，请重新登录";
  } else {
    return JSON.parse(JSON.stringify(res));
  }
}

module.exports = {
  getToken,
  handleToken,
};
