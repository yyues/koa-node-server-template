const Controller = require( 'egg' ).Controller;
const moment = require( 'moment' );

class BaseController extends Controller {
  // 获取当前操作员方法 主要为了获取 uid
  async currentUser() {
    const token = this.ctx.request.header.token;
    if ( !token ) {
      return { uid: null };
    }
    const res = await this.ctx.model.User.findOne( {
      where: {
        access_token: token,
        is_delete: false,
      },
    } );
    if ( !res ) {
      return { uid: null };
    }
    return res;
  }

  moment(date) {
    return moment(date)
  }

  // 自定义方法
  Validate( rules, query ) {
    let flag,
      error;
    try {
      this.ctx.validate( rules, query );
      flag = true;
    } catch (e) {
      error = e.errors;
      flag = false;
    }
    return {
      status: flag,
      error,
    };
  }

  success( data ) {
    this.ctx.body = {
      code: 200,
      status: 'SUCCESS',
      data,
      success: true,
    };
  }

  error( message, errors ) {
    this.ctx.body = {
      code: 200,
      status: 'error',
      errors,
      message,
      success: false,
    };
  }
}

module.exports = BaseController;
