const UserService =require('../sever/user')
const isEmpty =require('../util/isEmpty')

const {getOneDbData,getListDbData} =require('../util/json')
const Result = require('../util/result')
const {enCrypto} =require('../config/bcrypt')

module.exports={
  //注册的时候要不要带token？？？
  addUser: async ctx =>{
    let {username,password} = ctx.request.query

    // password=enCrypto(password)
    await UserService.createUser({username,password})
    ctx.body= {
      status:200,
      msg: 'success',
    }
  },
  findUSerById: async ctx =>{
    const id =ctx.request.query.id
    console.log(id);
    if(id){
      const find = await UserService.getUserById(id).then(res=>{
        return getOneDbData(res)
      })
      if(find){
        ctx.body=Result.success(find,'数据查找成功')
      } else {
        ctx.body=Result.waring(500,'数据不存在')
      }
    } else {
      ctx.body=Result.error('id 不存在')
    }
  },
  updateUser: async ctx =>{
    let {username,password,token,id} = ctx.request.query
    if(id){
      //  id存在，查找数据库
      const db = await UserService.getUserById(id).then(res=>{
        return getOneDbData(res)
      })
      if(db){
        // id存在 ，更新数据库
        username =isEmpty(username,db.username)
        password=isEmpty(password,db.password)
        token=isEmpty(token,db.token)
        await UserService.updateUser(id,{username,password,token})
        ctx.body=Result.success('11','用户数据更新成功')

      } else {
        // 数据库中不存在此id ，返回差无数据
        ctx.body=Result.waring(400,'id不存在，error')
      }
    } else {
      ctx.body=Result.error('id不存在，请求错误')
    }
  },
  delUser: async ctx =>{
    const id = ctx.request.query.id
    const user =  UserService.getUserById(id)
    if(user){
      await UserService.delUser(id)
      ctx.body={
        status:200,
        msg:'success'
      }
    } else {
      ctx.body= {
        status:200,
        msg:'用户不存在',
      }
    }
  },
}