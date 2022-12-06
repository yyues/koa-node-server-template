'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }

  // mysql: {
  //     enable: true,
  //     package: 'egg-mysql',
  // },
  sequelize: {
    enable: true,
    package: 'egg-sequelize',
  },
  // oAuth2Server: {
  //     enable: true,
  //     package: 'egg-oauth2-server',
  // },
  mp: {
    enable: true,
    package: 'egg-mp',
  },
  validate: {
    enable: true,
    package: 'egg-validate',
  },
  // alinode: {
  //   enable: true,
  //   package: 'egg-alinode',
  // }
};
