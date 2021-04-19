const router =require('koa-router')()
const UserController =require('../controller/user')

router.get('/',async (ctx,next)=>{
  ctx.body = 'Hello World  heiheihei';
})
router.get('/home',async (ctx,next)=>{
  ctx.body='home'
})
router.post('/login',)
// router.get('/',async (ctx,next)=>{
//   ctx.body={
//     status:'1',
//     msg:'errot'
//   }
// })
module.exports= router