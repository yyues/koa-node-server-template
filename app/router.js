'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // app.all('/user/token', app.oAuth2Server.token());
  // app.get('/user/authorize', app.oAuth2Server.authorize(), 'user.code');
  // app.get('/user/authenticate', app.oAuth2Server.authenticate(), 'user.authenticate');
};
