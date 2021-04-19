const user =require('../model/user')
const { Sequelize } = require('sequelize')

class UserService {
  //根据id 值查找
  async getUserById(id) {
    return user.findAll({
      where: {
        id:id
      }
    })
  }
  // 查找所有
  async getAll(){
    return user.findAll()
  }
  //根据name查找
  async getUserByUserName(name){
     return await user.findAll({
      where: {
        username: name
      }
    })
  }
  //新建用户
  async createUser(data) {
    return user.create(data)
  }
  //更新用户
  async updateUser(id,data) {
    return user.update(data,{
      where :{
        id:id
      }
    })
  }
  //删除用户
  async delUser(id){
    return user.destroy({
      where: {
        id: id
      }
    })
  }
}
module.exports= new UserService()