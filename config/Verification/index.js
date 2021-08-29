/*
 * @author yaoyue
 * @create 20210419
 * @des 生成验证码工具，前端请求返回即可
 * */

const svgCode = require('svg-captcha')

const codeConfig = {
  size: 4, //验证码长度
  ignoreChars: '0oli',
  fontSize: 32,
  width: 80,
  height: 30
}

const res = svgCode.create(codeConfig)
const getCode = () => {
  return res.data
}
const getCodeText = () => {
  return res.text
}
module.exports = {
  getCode,
  getCodeText
}
