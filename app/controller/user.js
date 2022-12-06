// app/controller/users.js
const Controller = require( '../core/base_controller' );

class UserController extends Controller {
  //  小程序登录流程， 主要是两个部分，授权 + 登录

  async WxLogin() {
    // 该方法提供的是 授权 登录一体式的
    const { ctx, service } = this;
    const rules = {
      code: { type: 'string', required: true },
      encryptedData: { type: 'string', required: true },
      iv: { type: 'string', required: true },
      signature: { type: 'string', required: false },
      userInfo: { type: 'object', required: true },
    };
    // 校验  参数
    const val = this.Validate( rules, ctx.request.body );
    if ( !val.status ) {
      // 校验 不通过
      this.error( '校验不通过', val.error );
      return;
    }
    // 根据 code 获取 唯一 openid
    const WxRes = await service.mp.login( ctx.request.body.code );
    // 获取 微信 服务端返回的 token
    const WxToken = await service.mp.getToken();
    //
    console.log( WxToken );
    const { openid, session_key } = WxRes;
    const { access_token, expires_in } = WxToken;
    // 查找 是否存在当前用户- 没有就创建
    const { userInfo } = ctx.request.body;
    const [ dbRes, created ] = await ctx.model.User.findOrCreate( {
      where: {
        openid,
        is_delete: false,
      },
      defaults: {
        user_name: userInfo.nickName,
        avatar_url: userInfo.avatarUrl,
        openid,
        session_key,
        access_token,
        expires_in,
        login_time: new Date(), // 记录用户登录时间
        login_status: true,
      },
    } );
    if ( created ) {
      // 表示当前没有用户，新建了一个用户
    } else {
      // 更新用户登录时间
      await ctx.model.User.update( {
        login_time: new Date(), login_status: true, user_name: userInfo.nickName, avatar_url: userInfo.avatarUrl,
      }, {
        where: {
          openid,
          is_delete: false,
        },
      } );
    }
    const res = await ctx.model.User.findOne( { where: { openid } } )
    this.success( res );
  }

  async WxAuthorize() {
    const { ctx, serve } = this;
  }

  async UpdateUserInfo() {
    const { ctx } = this
    //  更新用户数据
    const { uid } = await this.currentUser()
    if ( !uid ) {
      this.error( 'uid不存在', [] )
      return
    }
    const res = await ctx.model.User.update( ctx.request.body, {
      where: { uid, is_delete: false }
    } )
    this.success( res )
  }

}

module.exports = UserController;
