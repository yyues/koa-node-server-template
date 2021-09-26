// @ts-nocheck

// 引入拆分好的服务层数据，方便调用
const UserService = require('./service')

// 引用token，作为后续登陆请求索引值，检测标准
const { getToken, handleToken } = require('../../Config/Token')
const Result = require('../../Util/Result')

const handleRegister = async ctx => {
  // 创建用户信息，post请求，format-data 格式 ，body里取数据,基本不需要校验格式
  let { username, password } = ctx.request.body
  //   调用定义好的类功能，直接实现该功能
  const res = await UserService.getUserByUserName(username)
  if (res) {
    ctx.body = Result.error('账号已存在！')
  } else {
    await UserService.createUserInfo({ username, password })
    ctx.body = Result.success('注册成功')
  }
}
const handleDeleteUser = async ctx => {
  // 删除用户信息，del请求，query 作为ctx参数，不需要校验格式, 需要注意是否执行软删除
  let { id } = ctx.request.query
  const res = UserService.deleteUserInfo(id)
  ctx.body = res ? Result.success('删除成功') : Result.error('删除失败')
}
const handleGetUserListInfo = async ctx => {
  // 获得用户列表，get请求，query作为ctx参数，不需要校验格式
  // limit 分页后的每页数量，page，offset 和 limit的乘积，用来实现分页功能
  let { limit, page } = ctx.request.query
  const data = await UserService.getUserAllAndCount(parseInt(limit), parseInt(page))
  ctx.body = data ? { code: 200, msg: '查找成功', data } : { code: 500, msg: '查找失败' }
  // 记得实现过滤密码或者对密码加密
}
const handleFindOneUserInfo = async ctx => {
  const { id } = ctx.request.query
  const res = await UserService.getUserById(id)

  ctx.body = res ? { code: 200, msg: '查找成功', data: res } : { code: 500, msg: '查找失败' }
}
const handleUpdateUserInfo = async ctx => {
  // 修改用户信息，post请求，format-data 格式 ，body里取数据,基本不需要校验格式
  let { id, username, password } = ctx.request.body
  //   此处可以考虑下是否在修改密码的状态下修改token
  const IsExist = await UserService.getUserById(id)
  if (IsExist) {
    const res = await UserService.updateUserInfo(id, { username, password })
    ctx.body = res ? { code: 200, msg: '修改成功' } : { code: 500, msg: '修改失败' }
  } else {
    ctx.body = { code: 403, msg: 'id不存在' }
  }
}
const handleLogin = async ctx => {
  // 登录接口，post请求，format-data 格式 ，body里取数据，不需要校验格式
  let { username, password } = ctx.request.body
  const token = getToken({ username })
  const res = await UserService.getUserByUserName(username)
  if (res && res.password == password) {
    await UserService.updateUserInfo(res.id, { token })
    ctx.body = Result.success('登录成功', { token })
  }
  if (res && res.password !== password) {
    ctx.body = Result.error('账号或密码错误')
  }
  if (!res) ctx.body = Result.error('账号不存在')
}
module.exports = {
  handleRegister,
  handleDeleteUser,
  handleGetUserListInfo,
  handleUpdateUserInfo,
  handleLogin,
  handleFindOneUserInfo
}
