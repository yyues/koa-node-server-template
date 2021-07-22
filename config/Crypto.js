/*
 * @Author: yaoyue
 * @Date: 2021-07-20 10:09:26
 * @LastEditTime: 2021-07-20 13:19:03
 * @LastEditors: Please set LastEditors
 * @Description: 加密解密模块，用来对敏感字段进行加密，对于具体实现途径略有问题
 * @FilePath: \Base-Koa\config\Crypto.js
 */
const crypto = require("crypto");

const secret = "yyues";


function enCrypto(data) {
  const cipher = crypto.createCipheriv("aes-192-ccm", secret);
  let enc = cipher.update(data, "utf-8", "hex");
  return (enc += cipher.final("hex"));
}
function deCrypto(data) {
  const decipher = crypto.createDecipheriv("aes192", secret);
  let dec = decipher.update(enc, "hex", "utf8");
  return (dec += decipher.final("utf8"));
}

module.exports = {
  enCrypto,
  deCrypto,
};
