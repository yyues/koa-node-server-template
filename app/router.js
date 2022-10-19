'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get( '/', controller.home.index );
  router.post( '/wx-login', controller.user.wxLogin );
  router.post( '/getUserInfo', controller.user.getUserInfo );
  router.post( '/updateUserInfo', controller.user.updateUserInfo );
  // app.all('/user/token', app.oAuth2Server.token());
  // app.get('/user/authorize', app.oAuth2Server.authorize(), 'user.code');
  // app.get('/user/authenticate', app.oAuth2Server.authenticate(), 'user.authenticate');
};
