/*
 * @ author yaoyue
 * @createTime 20210419
 * @des token生成器
 * */
const jwt = require("jsonwebtoken");
const { Base } = require("./index");
function EncodeToken(payload) {
  return (
    "Bearer " +
    jwt.sign(payload, Base.secretOrKey, { expiresIn: Base.tokenExpiresIn })
  );
}
function decodeToken(token) {
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
    return "登录国企请重新登录";
  } else {
    return JSON.parse(JSON.stringify(res));
  }
}

module.exports = {
  EncodeToken,
  decodeToken,
};
