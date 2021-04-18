const router =require('koa-router')()

router.get('/',async (ctx,next)=>{
  ctx.body = 'Hello World  heiheihei';
})
router.get('/home',async (ctx,next)=>{
  ctx.body='home'
})
// router.get('/',async (ctx,next)=>{
//   ctx.body={
//     status:'1',
//     msg:'errot'
//   }
// })
module.exports= router