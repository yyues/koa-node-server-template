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
  router.post( '/update-user', controller.user.UpdateUserInfo )
  //  待办相关的接口
  router.get( '/todo/getList', controller.todo.getList );
  router.post( '/todo/save', controller.todo.save );
  router.post( '/todo/delete', controller.todo.delete );
  router.get( '/todo/find', controller.todo.findOne );
  router.post( '/todo/receive-invite', controller.todo.receiveInvite );
  router.post( '/todo/send-invite', controller.todo.sendInvite );
  router.get( '/todo/get-by-date', controller.todo.getTodoByDate );
  router.post( '/todo/delay', controller.todo.delayTodo );
  router.post( '/todo/finish', controller.todo.finishTodo );
  router.post( '/todo/set-clock', controller.todo.setClockTimeById );
  //  圈子相关的接口
  router.get( '/circle/getList', controller.circle.getList );
  router.get( '/circle/get-user-circle', controller.circle.getAllUsers );
  router.post( '/circle/save', controller.circle.save );
  router.post( '/circle/delete', controller.circle.delete );
  router.get( '/circle/find', controller.circle.findOne );
  router.post( '/circle/join', controller.circle.join );
  router.post( '/circle/agree', controller.circle.agree );

  //  动态相关的接口
  router.get( '/square/getList', controller.square.getList );
  router.post( '/square/save', controller.square.save );
  router.post( '/square/delete', controller.square.delete );
  router.get( '/square/find', controller.square.findOne );
  // 点赞
  router.get( '/star/give', controller.star.Star );
  router.get( '/star/cancel', controller.star.noStar );
  // 消息
  router.get( '/message/getList', controller.message.getList );
  router.get( '/message/cancel', controller.message.cancel );
  router.get( '/message/findOne', controller.message.findOne );
  router.get( '/message/findAll', controller.message.findAll );
  router.post( '/message/send', controller.message.send );
  //文件上传
  router.get( '/upload', controller.uploadPicture.index ); //上传文件路由，使用formData
  router.post( '/upload', controller.uploadPicture.upload );
  // 配置
  router.post( '/config/save', controller.config.save );
  // app.all('/user/token', app.oAuth2Server.token());
  // app.get('/user/authorize', app.oAuth2Server.authorize(), 'user.code');
  // app.get('/user/authenticate', app.oAuth2Server.authenticate(), 'user.authenticate');
};
