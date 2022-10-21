'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get( '/', controller.home.index );
  // 用户登录的接口
  router.post( '/wx-login', controller.user.WxLogin );
  router.post( '/wx-Authorize', controller.user.WxAuthorize );
  //  待办相关的接口
  router.get( '/todo/getList', controller.todo.getList );
  router.post( '/todo/save', controller.todo.save );
  router.post( '/todo/delete', controller.todo.delete );
  router.get( '/todo/find', controller.todo.findOne );
  //  圈子相关的接口
  router.get( '/circle/getList', controller.circle.getList );
  router.post( '/circle/save', controller.circle.save );
  router.post( '/circle/delete', controller.circle.delete );
  router.get( '/circle/find', controller.circle.findOne );
  // 点赞
  router.get( '/star/give', controller.star.Star );
  router.get( '/star/cancel', controller.star.noStar );
  // 消息
  router.get( '/message/cancel', controller.message.cancel );
  router.get( '/message/findOne', controller.message.findOne );
  router.get( '/message/findAll', controller.message.findAll );
  router.post( '/message/send', controller.message.send );
  // app.all('/user/token', app.oAuth2Server.token());
  // app.get('/user/authorize', app.oAuth2Server.authorize(), 'user.code');
  // app.get('/user/authenticate', app.oAuth2Server.authenticate(), 'user.authenticate');
};
