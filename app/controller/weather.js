'use strict';

const Controller = require( '../core/base_controller' );


class WeatherController extends Controller {
  async index() {
    const { city } = await this.currentUser()
    if ( !city ) {
      return this.error( '当前用户没有所在位置信息', [] )
    }

  }
}

module.exports = WeatherController;
