/*
* @ author yaoyue
* @createTime 20210419
* @des token生成器
* */
const jwt = require('jsonwebtoken')
const { Base} =require('./index')

const token= (payload) =>{
  return "Bearer " + jwt.sign(payload,Base.secretOrKey,Base.tokenExpiresIn)
}

module.exports = token()