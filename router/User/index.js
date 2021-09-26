/*
 * @Author: yaoyue
 * @Date: 2021-07-20 10:09:26
 * @LastEditTime: 2021-07-22 09:20:50
 * @LastEditors: Please set LastEditors
 * @Description: user及相关路由
 * @FilePath: \Base-Koa\router\user.js
 */
const router = require('koa-router')()
const {
  handleUpdateUserInfo,
  handleGetUserListInfo,
  handleDeleteUser,
  handleFindOneUserInfo
} = require('../../components/User/control')
router.prefix('/user')
router.get('/', async ctx => {
  ctx.body = { code: 200, msg: '好久不见呐，你怎么样了' }
})

router.post('/update', handleUpdateUserInfo)
router.get('/findList', handleGetUserListInfo)
router.delete('/delete', handleDeleteUser)
router.get('/findOne', handleFindOneUserInfo)
module.exports = router
