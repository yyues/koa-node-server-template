class Result {
  IDNotExist() {
    return {
      status: 500,
      msg: "id不存在，请检查",
    };
  }
  NameNotExist(name) {
    return {
      status: 500,
      msg: `${name}不存在，请检查`,
    };
  }
  success(msg, data) {
    return {
      status: 200,
      msg: msg,
      data: data || null,
    };
  }
  error(msg) {
    return {
      status: 500,
      msg: msg,
    };
  }
  waring(status, msg) {
    return {
      status: status,
      msg: msg,
    };
  }
  noLogin() {
    return {
      status: 401,
      msg: "用户尚未登录，请重新登录",
    };
  }
  loginOutTime() {
    return {
      status: 401,
      msg: "登录过期，请重新登录",
    };
  }
}
module.exports = new Result();
