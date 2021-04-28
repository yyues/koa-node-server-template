const crypto = require("crypto");
//封装加密
//公共秘钥
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
