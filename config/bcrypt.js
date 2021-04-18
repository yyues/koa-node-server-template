const bcrypt =require('bcrypt')
//封装加密
const tool = {
  enbcrypt(password) {

    const salt=bcrypt.genSaltSync(10)
    const hash =bcrypt.hashSync(password,salt)
    return hash
  }

}
module.exports= tool