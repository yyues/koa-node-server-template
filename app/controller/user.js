// app/controller/users.js
const Controller = require( 'egg' ).Controller;
const loginRule = {
  code: { type: 'string', required: true }
}

class UserController extends Controller {
  async wxLogin() {
    const { ctx, service } = this
    // 微信登录 需要 接受 code 的参数
    let code, data, success, error, message
    //校验参数
    try {
      ctx.validate( loginRule, ctx.request.body )
    } catch (e) {
      error = e.errors
    }
    if ( error ) {
      //   校验不通过 return
      ctx.body = {
        code: 200,
        status: 'VALIDATE_ERROR',
        error,
        message: '登录校验未通过！',
        success: false
      }
      return
    }
    const res = await service.mp.login( ctx.request.body.code )
    // 登录错误 返回错误
    if ( res.errcode && res.errmsg ) {
      ctx.body = {
        status: 'Error',
        error: [ res ],
        code: 401,
        message: '账号登录出现错误！',
        success: false
      }
      return
    }
    if ( res.openid && res.session_key ) {
      //  登录成功
      //  第一步，查找是否存在账户
      const account = await ctx.model.User.findOne( {
        where: {
          is_delete: false, // 账户没有被删除
          openid: res.openid
        }
      } )
      // 账户不存在的情况下， 创建一个 新的账户，然后提示更新用户信息
      if ( !account ) {
        //   不存在当前用户，但是登录没问题，表示新建用户
        await ctx.model.User.create( {
          openid: res.openid,
          need_update_info: true
        } )
        data = await ctx.model.User.findOne( {
          where: {
            is_delete: false, // 账户没有被删除
            openid: res.openid
          }
        } )
        ctx.body = {
          status: 'LOGIN_SUCCESS', // 指 没有注册用户
          code: 200,
          data,
          success: true
        }
        return
      }
      // 用户注册完后立刻退出，没有点同意
      console.log( account.need_update_info, 'val-' )
      if ( account.need_update_info ) {
        //  或者说 用户注册了但是没有更新用户信息
        ctx.body = {
          status: 'LOGIN_SUCCESS', //  此处指没有更新用户信息
          code: 200,
          data: account,
          success: true
        }
        return
      }
      //
      ctx.body = {
        status: 'LOGIN_SUCCESS', // 指 没有注册用户
        code: 200,
        data: account,
        success: true
      }
      return
    }
    ctx.body = {
      status: 'SERVE_ERROR',
      code: 500,
      error: [],
      message: '服务器出现未知错误',
      success: false
    }
  }

  async getUserInfo() {
    const ctx = this.ctx
    const service = this.service
    let error
    try {
      ctx.validate( { uid: { type: 'string', required: true } }, ctx.request.body )
    } catch (e) {
      error = e.errors
    }
    if ( error ) {
      //   校验不通过 return
      ctx.body = {
        code: 200,
        status: 'VALIDATE_ERROR',
        error,
        message: 'uid 校验不通过',
        success: false
      }
      return
    }
    // 获取基本信息
    const userinfo = await ctx.model.User.findOne( {
      where: {
        uid: ctx.request.body.uid,
        is_delete: false
      }
    } )
    if ( !userinfo ) {
      ctx.body = {
        code: 200,
        status: 'NO_EXIST',
        error,
        message: '用户不存在',
        success: false
      }
      return

    }
    //  获取用户待办表 数量
    //  获取用户的圈子信息, 只包括 id
    //  获取用户当前的待办数据
    //  获取用户当前的任务
    ctx.body = {
      status: 'SUCCESS', // 指 没有注册用户
      code: 200,
      data: {
        ...userinfo
      },
      success: true
    }
  }

  async updateUserInfo() {
    const ctx = this.ctx
    const query = ctx.request.body
    console.log( query, 'update user info' )
    const rules = {
      openid: { required: true, type: 'string', }
    }
    let error
    try {
      ctx.validate( rules, query )
    } catch (e) {
      error = e.errors
    }
    if ( error ) {
      //   校验不通过 return
      ctx.body = {
        code: 200,
        status: 'VALIDATE_ERROR',
        error,
        message: '校验不通过',
        success: false
      }
      return
    }
    const res = await ctx.model.User.findOne( {
      where: { openid: query.openid }
    } )
    if ( !res ) {
      ctx.body = {
        code: 200,
        status: 'NO_EXIST',
        error,
        message: '用户不存在',
        success: false
      }
      return
    }
    const data = {
      ...query,
    }
    // 尝试更新 ，失败则单独抛出返回
    try {
      await ctx.model.User.update( data, {
        where: { openid: query.openid }
      } )
      ctx.body = {
        code: 200,
        status: 'SUCCESS',
        data: {},
        success: true
      }
    } catch (e) {
      ctx.body = {
        code: 200,
        status: 'UPDATE_ERROR',
        error: [],
        message: '更新用户失败',
        success: false
      }
    }
  }

}

module.exports = UserController;