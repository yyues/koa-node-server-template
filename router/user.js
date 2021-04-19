const router =require('koa-router')()
const UserController =require('../controller/user')

router.prefix('/user')
router.get('/',async (ctx,next)=>{
  ctx.body='user'
})
router.post('/add',UserController.addUser)
router.delete('/del',UserController.delUser)
router.post('/update',UserController.updateUser)
router.get('/find',UserController.findUSerById)

module.exports=router