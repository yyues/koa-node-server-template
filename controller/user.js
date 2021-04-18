const UserService =require('../sever/user')

module.exports={
  addUser: async (ctx,next) =>{
    let {username,password} = ctx.request.query
    await UserService.createUser({"id":'2',"username":username,"password":password})
    ctx.body= {
      status:200,
      msg:'success',
    }
  },
  delUser: async (ctx,next) =>{
    const {id} = ctx.request.body
    const user = UserService.getUserById(id)
    if(user){
      ctx.body={
        status:200,
        msg:'不存在该用户'
      }
    } else {
      ctx.body= {
        status:200,
        msg:'success',
      }
    }
  },
}