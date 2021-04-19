const bcrypt =require('bcrypt')
//封装加密
class Tool {
  enbcrypt(password) {
    const salt=bcrypt.genSaltSync(10)
    const hash =bcrypt.hashSync(password,salt)
    return hash
  }

}
module.exports= new Tool()