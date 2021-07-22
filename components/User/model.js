/*
 * @Author: yaoyue
 * @Date: 2021-07-22 09:14:37
 * @LastEditTime: 2021-07-22 11:07:40
 * @LastEditors: Please set LastEditors
 * @Description: 还是将模式拆分出来了，结构太臃肿了，下面是基于数据库模型model来命名的，
 * @FilePath: \Base-Koa\components\User\model.js
 */
// 引用自己的 sequelize 数据库配置
const db = require("../../Config/DB");
// 引用sequelize 里的类型校验
const { DataTypes } = require("sequelize");
// 尽量不使用unique ，https://www.chaoswork.cn/20190724-1.html
const user = db.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      // 自动递增
      autoIncrement: true,
      allowNull: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: "username",
    },
    password: {
      type: DataTypes.STRING,
    },
    token: {
      type: DataTypes.STRING,
    },
  },
  {
    // 使得定义的表名和设置一样，默认的会在后面加个s ，如 users
    freezeTableName: true,
    // 下面两列对于sequelize时间的修改
    updatedAt: "updateTime",
    createdAt: "createTime",
  }
);
// 直接的是这个，要是修改的话会用到alter属性
user.sync({ alter: true });
module.exports = user;
