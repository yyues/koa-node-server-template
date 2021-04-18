const router =require('koa-router')()
const UserController =require('../controller/user')

router.prefix('/user')
router.get('/',async (ctx,next)=>{
  ctx.body='user'
})
router.post('/add',UserController.addUser)
router.delete('/del:id',UserController.delUser)

module.exports=router