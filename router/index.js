const router =require('koa-router')()

router.get('/',async (ctx,next)=>{
  ctx.body = 'Hello World  heiheihei';
})
router.get('/home',async (ctx,next)=>{
  ctx.body='home'
})
module.exports= router