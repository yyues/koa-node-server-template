module.exports = options => {
  return async function loginValidate( ctx, next ) {
    const whiteList = options.whiteList;
    const url = ctx.request.url;
    if ( options.admin ) {
      // 超级管理员 不需要校验
      await next();
      return;
    }
    if ( whiteList && Array.isArray( whiteList ) && whiteList.includes( url ) ) {
      // 白名单里面的不用 校验
      await next();
      return;
    }
    const access_token = ctx.request.header.token;
    const NO_LOGIN = {
      code: 401,
      status: 'NO_LOGIN',
      message: '请先登录！',
      success: false,
    };
    if ( !access_token ) {
      ctx.body = NO_LOGIN;
      return;
    }
    // 检验 数据库里 的 数据
    const res = await ctx.model.User.findOne( {
      where: {
        access_token,
        is_delete: false,
      },
    } );
    // 没查到数据，重新登录
    if ( !res ) {
      ctx.body = NO_LOGIN;
      return;
    }
    // 检验是否过期
    const { login_time, openid } = res;
    // 登录过期
    const timeout = 1000 * 60 * 60 * 24 * 7;
    if ( new Date().getTime() > login_time.getTime() + timeout ) {
      ctx.body = {
        code: 403,
        status: 'LOGIN_EXPIRES_OUT',
        message: '登录过期！',
        success: false,
      };
      return;
    }
    // 登录没过期，  更新当前登录时间
    await ctx.model.User.update( {
      login_time: new Date(), login_status: true,
    }, {
      where: {
        openid,
        is_delete: false,
      },
    } );
    await next();
  };
};
