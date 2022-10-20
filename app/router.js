'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // 用户登录的接口
  router.post('/wx-login', controller.user.WxLogin);
  router.post('/wx-Authorize', controller.user.WxAuthorize);
  //  待办相关的接口
  router.get('/todo/getList', controller.todo.getList);
  router.post('/todo/save', controller.todo.save);
  // app.all('/user/token', app.oAuth2Server.token());
  // app.get('/user/authorize', app.oAuth2Server.authorize(), 'user.code');
  // app.get('/user/authenticate', app.oAuth2Server.authenticate(), 'user.authenticate');
};
