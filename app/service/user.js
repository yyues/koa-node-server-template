"use strict";

const { Service } = require( 'egg' );

class UserService extends Service {
  async find() {
    const user = {
      data: '122'
    }
    return user;
  }
}

module.exports = UserService;