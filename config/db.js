const { Sequelize } = require("sequelize");
const { config } = require("../config/index");
const db = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  logging: false,
});
module.exports = db;
