/*
 * @Author: yaoyue
 * @Date: 2021-07-22 09:16:26
 * @LastEditTime: 2021-07-22 09:29:31
 * @LastEditors: Please set LastEditors
 * @Description: 服务层，意在拆分出实现集体功能的层，向control层提供基础运算逻辑
 * @FilePath: \Base-Koa\components\User\service.js
 */
const user = require("./model");
class UserService {
  // 根据id查找数据
  async getUserById(id) {
    return await user.findAll({
      where: {
        id,
      },
    });
  }
  // 根据 username 查找
  async getUserByUserName(username) {
    return await user.findOne({
      where: {
        username,
      },
    });
  }
  //   根据username 和passwor登录
  async Login(username, password) {
    return await user.findOne({
      where: { username, password },
    });
  }
  // 分页数据，初始偏移limit0，偏移量 offset 10,记得检验数据格式，int
  async getUserAllAndCount(limit = 10, page = 0) {
    return await user.findAndCountAll({
      offset: page * limit,
      limit,
    });
  }
  // 新建用户信息
  async createUserInfo(data) {
    return await user.create(data);
  }
  // 修改用户信息
  async updateUserInfo(id, data) {
    return await user.update(data, {
      where: { id },
    });
  }
  //   删除用户信息
  async deleteUserInfo(id) {
    return await user.destroy({
      where: {
        id,
      },
    });
  }
}
module.exports = new UserService();
