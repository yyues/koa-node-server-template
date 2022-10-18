'use strict';

const { Controller } = require( 'egg' );

class MpController extends Controller {
  async login() {
    const { ctx } = this
    console.log( ctx.request.body )
    ctx.body = {
      msg: '登录成功！'
    }
  }
}

module.exports = MpController;
