/*
 * @ author yaoyue
 * @createTime 20210419
 * @des demo's base config
 * */
const config = {
  database: "test",
  username: "root",
  password: "123456",
  port: "3306",
  dialect: "mysql",
  host: "localhost",
};
const Base = {
  port: "9000",
  secretOrKey: "secret",
  tokenExpiresIn: 3600 * 24 * 7,
  userArr: [],
};
module.exports = {
  config,
  Base,
};
