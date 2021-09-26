/*
 * @Author: yaoyue
 * @Date: 2021-07-20 13:50:10
 * @LastEditTime: 2021-07-22 09:52:09
 * @LastEditors: Please set LastEditors
 * @Description: 本意是将三个相同的功能集合到一个文件内，
 * 不知道有没有坏处，但还是要做到结果划分清楚，才能更好的使用
 * @FilePath: \Base-Koa\components\User\index.js
 */
// 引入拆分好的服务层数据，方便调用
const UserService = require('./service')
// 处理得到的数据库数据格式，转为对象的处理函数
const { getDataFromDb, getDatasFromDb } = require('../../Util/getDataFromDb')
// 引用token，作为后续登陆请求索引值，检测标准
const { getToken, handleToken } = require('../../Config/Token')
const Result = require('../../Util/Result')

const handleCreateUser = async ctx => {
  // 创建用户信息，post请求，format-data 格式 ，body里取数据,基本不需要校验格式
  let { username, password } = ctx.request.body
  //   调用定义好的类功能，直接实现该功能
  const res = UserService.createUserInfo({
    username,
    password,
    
  })
    .then(() => true)
    .catch(() => false)
  ctx.body = res
    ? { code: 200, msg: '添加成功' }
    : { code: 404, msg: '添加失败' }
}
const handleDeleteUser = async ctx => {
  // 删除用户信息，del请求，query 作为ctx参数，不需要校验格式, 需要注意是否执行软删除
  let { id } = ctx.request.query
  const res = UserService.deleteUserInfo(id)
    .then(() => true)
    .catch(() => false)
  ctx.body = res
    ? { code: 200, msg: '删除成功' }
    : { code: 404, msg: '删除失败' }
}
const handleGetUserListInfo = async ctx => {
  // 获得用户列表，get请求，query作为ctx参数，不需要校验格式
  // limit 分页后的每页数量，page，offset 和 limit的乘积，用来实现分页功能
  let { limit, page } = ctx.request.query
  let data = await UserService.getUserAllAndCount(
    parseInt(limit),
    parseInt(page)
  )
    .then(res => {
      return getDatasFromDb(res)
    })
    .catch(() => {
      return false
    })
  ctx.body = data
    ? { code: 200, msg: '查找成功', data }
    : { code: 500, msg: '查找失败' }
  // 记得实现过滤密码或者对密码加密
}
const handleFindOneUserInfo = async ctx => {
  const { id } = ctx.request.query
  const res = await UserService.getUserById(id)
    .then(res => getDataFromDb(res))
    .catch(() => false)
  ctx.body = res
    ? { code: 200, msg: '查找成功', data: res }
    : { code: 500, msg: '查找失败' }
}
const handleUpdateUserInfo = async ctx => {
  // 修改用户信息，post请求，format-data 格式 ，body里取数据,基本不需要校验格式
  let { id, username, password } = ctx.request.body
  //   此处可以考虑下是否在修改密码的状态下修改token
  const IsExist = await UserService.getUserById(id)
    .then(res => getDataFromDb(res))
    .catch(() => false)
  if (IsExist) {
    const res = await UserService.updateUserInfo(id, { username, password })
      .then(() => true)
      .catch(() => false)
    ctx.body = res
      ? { code: 200, msg: '修改成功' }
      : { code: 500, msg: '修改失败' }
  } else {
    ctx.body = { code: 403, msg: 'id不存在' }
  }
}
const handleLogin = async ctx => {
  // 登录接口，post请求，format-data 格式 ，body里取数据，不需要校验格式
  let { username, password } = ctx.request.body
  const token = getToken({username})
  let userId
  const isExist = await UserService.getUserByUserName(username)
    .then(res => {
      userId = getDataFromDb(res).id
      return getDataFromDb(res) ? true : false
    })
    .catch(() => false)
  if (isExist) {
    const res = await UserService.Login(username, password)
      .then(() => true)
      .catch(() => false)
    await UserService.updateUserInfo(userId, {token})
    ctx.body = res
      ? Result.success('登录成功', {token})
      : { code: 500, msg: '登录失败' }
  } else {
    ctx.body = { code: 500, msg: '账号不存在' }
  }
}
module.exports = {
  handleCreateUser,
  handleDeleteUser,
  handleGetUserListInfo,
  handleUpdateUserInfo,
  handleLogin,
  handleFindOneUserInfo
}
