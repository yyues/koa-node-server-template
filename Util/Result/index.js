class Result {
  IDNotExist() {
    return {
      code: 500,
      msg: 'id不存在，请检查'
    }
  }
  NameNotExist(name) {
    return {
      code: 500,
      msg: `${name}不存在，请检查`
    }
  }
  success(msg, data) {
    return {
      code: 200,
      msg: msg,
      ...data
    }
  }
  error(msg) {
    return {
      code: 500,
      msg: msg
    }
  }
  waring(code, msg) {
    return {
      code: code,
      msg: msg
    }
  }
  noLogin() {
    return {
      code: 401,
      msg: '用户尚未登录，请重新登录'
    }
  }
  loginOutTime() {
    return {
      code: 401,
      msg: '登录过期，请重新登录'
    }
  }
}
module.exports = new Result()
