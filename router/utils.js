const router =require('koa-router')()
const Result=require('../util/result')
const path =require('path')
const fs =require('fs')
router.post('/upload',ctx=>{
    const file = ctx.request.files.file
    if(!file){
        ctx.body=Result.error('没有发现id ！')
    } else {
        const basename =path.basename(file.path)
        if(!file.name && !file.type){
            fs.unlinkSync(file.path)
            ctx.body=Result.error('上传文件为空')
        } else {
            const type =file.type.split('/')[0]
            file.name=new Date().getTime().toString()+'.'+file.name.split('.')[1]
            const reader =fs.createReadStream(file.path)
            switch (type) {
                case 'image':
                    stream =fs.createWriteStream(path.join('public/image',file.name))
                    break
                case 'video':
                    stream =fs.createWriteStream(path.join('public/video',file.name))
                    break
                case 'application':
                    stream =fs.createWriteStream(path.join('public/file',file.name))
                    break
                default:
                    stream =fs.createWriteStream(path.join('public/upload',file.name))
            }
            reader.pipe(stream)
            const after_url = ctx.origin + stream.path.substr(6).replace(/\\/g,'/')
            ctx.body=Result.success(after_url,'上传文件成功')
        }
    }
})
module.exports=router
