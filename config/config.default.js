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
        middleware: ['compress', 'errorHandler'],
        compress: {
            threshold: 2048,
        },
        security: {
            csrf: {
                enable: false,
            },
        },
        errorHandler: {
            match: '/api'
        },
        proxy: true,
        // oAuth2Server: {
        //     debug: appInfo.env === 'local',
        //     grants: ['password', 'client_credentials'],
        // }
    };

    // config.mp = {
    //     appId: '', // 公众平台应用编号
    //     appSecret: '', // 公众平台应用密钥
    //     mchId: '', // 商户平台商家编号
    //     apiKey: '', // 商户支付密钥
    //     notifyUrl: '' // 支付结果回调地址
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
