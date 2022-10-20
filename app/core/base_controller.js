const Controller = require( 'egg' ).Controller;

class BaseController extends Controller {
  //自定义方法
  Validate( rules, query ) {
    let flag, error
    try {
      this.ctx.validate( rules, query )
      flag = true
    } catch (e) {
      error = e.errors
      flag = false
    }
    return {
      status: flag,
      error
    }
  }

  success( data ) {
    this.ctx.body = {
      code: 200,
      status: 'SUCCESS',
      data,
      success: true
    }
  }

  error( message, errors ) {
    this.ctx.body = {
      code: 200,
      status: 'error',
      errors,
      message,
      success: false
    }
  }
}

module.exports = BaseController;