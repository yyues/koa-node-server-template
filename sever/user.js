const user =require('../model/user')

class UserService {
  //根据id 值查找
  async getUserById(id) {
    return user.findAll({
      where: {
        id:id
      }
    })
  }
  //根据name查找
  async getUserByUserName(name){
    return user.findAll({
      where: {
        username: name
      }
    })
  }
  //新建用户
  async createUser(use) {
    return user.create(use)
  }
  //更新用户
  async updateUser(id,use) {
    const item = await this.getUserById(id)
    if(item){
      return  item.update(use)
    } else {
      return  new Error('the user is not exist !')
    }
  }
  //删除用户
  async delUser(id){
    const item =await this.getUserById(id)
    if(item){
      return item.destroy
    } else {
      return  new Error('the user is not exist !')
    }

  }
}
module.exports= new UserService()