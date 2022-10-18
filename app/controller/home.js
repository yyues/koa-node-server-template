'use strict';

const { Controller } = require( 'egg' );

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = {
      msg: 'hello, world !'
    };
  }
}

module.exports = HomeController;
