'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // 在执行数据库升级时调用的函数，创建 users 表
  up: async ( queryInterface, Sequelize ) => {
    const { INTEGER, DATE, STRING, BOOLEAN } = Sequelize;
    await queryInterface.createTable( 'users', {
      uid: { type: INTEGER( 6 ), primaryKey: true, autoIncrement: true, }, // 用户 uid
      user_name: STRING( 30 ),  // 用户 账号名称
      avatar_url: STRING, // 用户 头像连接
      login_status: {
        type: BOOLEAN,
        defaultValue: false,
      },  // 用户 登录状态
      login_time: DATE, // 用户 登录时间
      login_expiration_time: DATE, // 用户 登录过期时间
      login_ip: STRING, // 用户 地址
      login_agent: STRING, // 用户 会话
      cookie_duration: INTEGER, // 用户 cookie 时长  单位毫秒 INT
      token: STRING, // 用户 toke
      cookie: STRING,// 用户 cookie
      session_key: STRING,// wx session_key
      openid: STRING,// wx openid
      unionid: STRING, // wx unionid
      login_browser: STRING, // 用户 浏览器
      total_task_count: {
        type: INTEGER,
        defaultValue: 0,
      }, // 用户 账号下 所有的待办数量
      current_task_view: {
        type: INTEGER,
        defaultValue: 0,
      },// 用户 账号下 当前还未的待办数量
      remark: STRING( 19 ), // 账号备注
      description: STRING( 99 ),//  账号描述
      need_update_info: { type: BOOLEAN, defaultValue: false }, // 主要用在 创建账户的时候，免得创建了账户但是没有用户信息
      is_delete: { type: BOOLEAN, defaultValue: false }, // 伪删除，正常状态是false，删除是true
      create_time: DATE,
      update_time: DATE,
    }, {
      // 不要忘记启用时间戳！
      timestamps: true,
      createdAt: 'create_time',
      updatedAt: 'update_time'
    } )
  },
  // 在执行数据库降级时调用的函数，删除 users 表
  down: async queryInterface => {
    await queryInterface.dropTable( 'users' );
  }
}
