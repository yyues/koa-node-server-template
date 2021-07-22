/*
 * @Author: your name
 * @Date: 2021-07-20 10:09:26
 * @LastEditTime: 2021-07-20 14:59:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Base-Koa\util\json.js
 */
const JSON = require("JSON");

const getDataFromDb = (data) => {
  return JSON.parse(JSON.stringify(data))[0];
};
const getDatasFromDb = (data) => {
  return JSON.parse(JSON.stringify(data));
};

module.exports = {
  getDataFromDb,
  getDatasFromDb,
};
