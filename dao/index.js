const db=require('../db/index')
const { Sequelize } = require('sequelize');
const Account = db.define('user', {
  id: {
    type: Sequelize.UUID,
    allowNull: false,
    primaryKey: true, // 设置主键
  },
  username: {
    type: Sequelize.STRING,
    unique: true, // 这里通过unique 设置用户名必须唯一，不允许重复。
    allowNull: false, // 不允许为空
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
  },
},{
  timestamps: true,  // 默认为true， false禁止创建createAt，updateAt 字段
  updateAt: 'updateTime', // 创建updateTimestamp字段来代替updateAt 字段。
  createdAt:'createTime'
});
module.exports= Account

