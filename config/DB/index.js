/*
 * @Author: yaoyue
 * @Date: 2021-07-20 10:09:26
 * @LastEditTime: 2021-07-21 11:47:37
 * @LastEditors: Please set LastEditors
 * @Description: 数据库配置基础，利用sequelize来实现操作数据库的设置
 * @FilePath: \Base-Koa\config\db.js
 */

const { Sequelize } = require("sequelize");
const { config } = require("../index");
const db = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  typeValidation: true,
  dialectOptions: {},
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  logging: false,
});
module.exports = db;
