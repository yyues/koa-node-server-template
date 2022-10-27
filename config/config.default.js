/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {
    // use for cookie sign key, should change to your own and keep security
    keys: appInfo.name + '_1666058000066_4953',
    // add your middleware config here
    middleware: [ 'loginValidate', 'errorHandler', 'compress' ],
    compress: {
      threshold: 2048,
    },
    security: {
      csrf: {
        enable: false,
      },
    },
    loginValidate: {
      whiteList: [ '/wx-login', '/upload' ],
    },
    errorHandler: {},
    proxy: true,
    // oAuth2Server: {
    //     debug: appInfo.env === 'local',
    //     grants: ['password', 'client_credentials'],
    // }
    sequelize: {
      dialect: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      database: 'wx-todo',
      username: 'root',
      password: '123456',
    },
  };

  config.mp = {
    appId: 'wx9af318c392c00a54', // 公众平台应用编号  目前是测试数据
    appSecret: 'a5fde7fb39fe2de1f169ea2f97a442f3', // 公众平台应用密钥
    mchId: '', // 商户平台商家编号
    apiKey: '', // 商户支付密钥
    notifyUrl: '', // 支付结果回调地址
  };
  //文件上传
  config.multipart = {
    mode: 'file'
  }

  exports.validate = {
    convert: true,
    // validateRoot: false,
  };
  // exports.alinode = {
  //   // 从 `Node.js 性能平台` 获取对应的接入参数
  //   appid: 'yyues',
  //   secret: 'Zxc17630969845',
  // };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
