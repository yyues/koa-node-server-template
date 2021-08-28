/*
 * @Author: your name
 * @Date: 2021-07-20 15:13:07
 * @LastEditTime: 2021-07-22 10:32:28
 * @LastEditors: Please set LastEditors
 * @Description: 通用接口处理
 * @FilePath: \Base-Koa\components\Common\index.js
 */
const path = require('path')
const fs = require('fs')
const Result = require('../../Util/Result')
const handleUpload = async ctx => {
  const file = ctx.request.files.file
  if (!file) {
    ctx.body = Result.IDNotExist()
  } else {
    if (!file.name && !file.type) {
      fs.unlinkSync(file.path)
      ctx.body = Result.error('上传文件为空')
    } else {
      const type = file.type.split('/')[0]
      // file.name =
      //   new Date().getTime().toString() + "." + file.name.split(".")[1];
      const reader = fs.createReadStream(file.path)
      let stream
      switch (type) {
        case 'image':
          stream = fs.createWriteStream(path.join('public/image', file.name))
          break
        case 'video':
          stream = fs.createWriteStream(path.join('public/video', file.name))
          break
        case 'application':
          stream = fs.createWriteStream(path.join('public/file', file.name))
          break
        default:
          stream = fs.createWriteStream(path.join('public/upload', file.name))
      }
      reader.pipe(stream)
      // @ts-ignore
      const after_url = ctx.origin + stream.path.substr(6).replace(/\\/g, '/')
      ctx.body = Result.success('上传文件成功', after_url)
    }
  }
}
module.exports = { handleUpload }
